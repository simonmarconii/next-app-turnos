"use client";

import { DateType } from "@/lib/definitions";
import Button from "./button";
import { FormEvent, useMemo, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Select from "./select";
import DatePicker from "./date-picker";
import { rescheduleSchedule, updateScheduleStatus } from "@/lib/actions";

function splitDateTime(raw: Date) {
    const normalized = raw.toISOString().replace("T", " ");
    const [datePart, timePart = ""] = normalized.split(" ");
    const time = timePart.slice(0, 5);
    return { datePart, time };
}

function getEditFormValues(raw: Date) {
    const { datePart, time } = splitDateTime(raw);
    return { date: datePart, time };
}

type FormData = {
    date: string;
    time: string;
    status: string;
};

const timeSlots = [
    "12:00",
    "14:00",
    "16:00",
    "18:00",
    "20:00",
];

type Props = {
    date: DateType;
    dates: DateType[];
}

function DateCard({ date, dates }: Props) {
    const [editingDate, setEditingDate] = useState<DateType | null>(null);
    const [completeDate, setCompleteDate] = useState<DateType | null>( null);
    const [submitting, setSubmitting] = useState(false);
    const [editForm, setEditForm] = useState({ ...getEditFormValues(date!.date), status: date!.status });

    const router = useRouter();

    function formatUTCTimeToArgentina(utcTime: string) {
        const [hour, minute] = utcTime.split(":").map(Number);
        // The date is irrelevant, i only use the hour and minute
        const anchorDate = new Date(Date.UTC(2000, 0, 1, hour, minute));
        return anchorDate.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "America/Argentina/Buenos_Aires",
        });
    }
    
    const bookedTimesForSelectedDate = useMemo(() => {
        if (!editForm.date) return [];
        /*
        In this function i take all the dates in the db and first cut them in date (i.e. 2026/07/15) and time (i.e. 12:00)
        and then filter them by the date that are equal to the date that the user selected in the form
        and finally return an array of the times that are already booked
         */
        return dates
            .filter((currentDate) => currentDate?.id !== editingDate?.id)
            .map((d) => splitDateTime(d!.date))
            .filter((d) => d.datePart === editForm.date)
            .map((d) => d.time);
    }, [dates, editForm.date, editingDate?.id]);

    function handleDateChange(value: string) {
        setEditForm((current) => ({ ...current, date: value, time: "" }));
    }

    function updateField(field: keyof FormData, value: string) {
        setEditForm((current) => ({ ...current, [field]: value }));
    }

    async function handleCompleteDateStatus(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!completeDate ) return;
        if (submitting) return;
        setSubmitting(true);

        try {
            const result = await updateScheduleStatus(completeDate.id, "completado");

            if (!result.success) {
                console.error("Failed to update date status", result.error);
                return;
            } else {
                setCompleteDate(null);
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to update date status:", error);
        }
        finally {
            setSubmitting(false);
        }
    }

    async function handleUpdateDate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!editingDate) return;
        if (!editForm.date && !editForm.time) return;
        if (submitting) return;
        setSubmitting(true);

        try {
            const result = await rescheduleSchedule(editingDate.id, {
                date: editForm.date,
                time: editForm.time,
            });

            if (!result.success) {
                console.error("Failed to update date:", result.error);
                return;
            } else {
                if (!result.data.emailSent) {
                    console.error("El turno fue reprogramado, pero no se pudo enviar el email");
                }
                setEditingDate(null);
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to update date:", error);
        }
        finally {
            setSubmitting(false);
        }
    }


  return (
    <>
        <div
            className="flex gap-2 sm:justify-between rounded-2xl border border-[#cdbfae] bg-white px-4 py-3 shadow-sm"
        >
            <div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1f1a16]">
                        Dia:
                    </p>
                    <p className="text-sm font-medium text-[#1f1a16]">
                        {new Date(date!.date).toLocaleString("es-AR", { weekday: "long", month: "long", day: "numeric", timeZone: "America/Argentina/Buenos_Aires" })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1f1a16]">
                        Hora:
                    </p>
                    <p className="text-sm font-medium text-[#1f1a16]">
                        {new Date(date!.date).toLocaleString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1f1a16]">
                        Cliente:
                    </p>
                    <p className="text-sm font-medium text-[#1f1a16]">
                        {date!.user?.name} {date!.user?.lastname}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1f1a16]">
                        Servicio:
                    </p>
                    <p className="text-sm font-medium text-[#1f1a16]">
                        {date!.service?.name} - ${date!.service?.price}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1f1a16]">
                        Estado:
                    </p>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${date!.status === "confirmado" ? "bg-[#e7ece4] text-[#40594e]" : "bg-[#efe6d8] text-[#7d3f2b]"}`}>
                            {date!.status === "confirmado" ? "Confirmado" : "Completado"}
                        </span>
                </div>
            </div>
            <div className="">
                <div className="flex items-center flex-col sm:flex-row gap-4">
                    <Button size="small" disabled={date!.status === "completado"} onClick={() => {
                        setEditingDate(date);
                        setEditForm({ ...getEditFormValues(date!.date), status: date!.status });
                    }}>
                        Reprogramar
                    </Button>
                    <Button aria-label="Completar turno" size="small" variant="secondary" disabled={date!.status === "completado"} onClick={() => setCompleteDate(date)}>
                        <FaCheck className="text-xl" />
                    </Button>
                </div>
            </div>
        </div>

        {editingDate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a16]/70 px-4 py-6 backdrop-blur-sm">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="edit-turno-title"
                    tabIndex={-1}
                    className="max-h-[calc(100svh-2rem)] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-[#cdbfae] bg-[#f8f3eb] shadow-[0_24px_70px_rgba(31,26,22,0.24)]"
                >
                    <div className="border-b border-[#d8cabd] bg-gradient-to-br from-[#eef3ec] via-[#f8f3eb] to-[#f4e7da] px-6 py-6 sm:px-8">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                            <p className="text-sm font-semibold text-[#4f6d60]">
                                {editingDate.status === "confirmado" ? "Reprogramar turno" : "Editar turno"}
                            </p>
                            <h2 id="edit-turno-title" className="mt-2 text-2xl font-semibold tracking-tight text-[#1f1a16]">
                                Turno del {new Date(editingDate.date).toLocaleString("es-AR", { 
                                    year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" 
                                })}
                            </h2>
                            </div>
                            <span className="rounded-full bg-[#e7ece4] px-3 py-1 text-xs font-semibold text-[#40594e]">
                                {editingDate.status === "confirmado" ? "Confirmado" : "Completado"}
                            </span>
                        </div>
                    </div>

                    <form className="space-y-5 p-6 sm:p-8" onSubmit={handleUpdateDate}>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="schedule-date" className="text-sm font-semibold text-[#4d4037]">
                                Fecha
                            </label>
                            <DatePicker id="schedule-date" value={editForm.date} onChange={handleDateChange} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="time" className="text-sm font-medium text-[#4d4037]">
                                Horario
                            </label>
                            <Select disabled={!editForm.date}>
                                <select
                                    id="time"
                                    name="time"
                                    value={editForm.time}
                                    onChange={(event) => updateField("time", event.target.value)}
                                    disabled={!editForm.date}
                                    className="block w-full appearance-none bg-transparent pr-8 outline-none"
                                >
                                    <option value="">Elegí un horario</option>
                                    {timeSlots.map((timeSlot) => {
                                        const isBooked = bookedTimesForSelectedDate.includes(timeSlot);
                                        const displayTime = formatUTCTimeToArgentina(timeSlot);
                                        return (
                                            <option
                                                key={timeSlot}
                                                value={timeSlot}
                                                disabled={isBooked}
                                            >
                                                {displayTime} {isBooked ? "(no disponible)" : ""}
                                            </option>
                                        );
                                    })}
                                </select>
                            </Select>
                        </div>
                        <div className="flex flex-col-reverse gap-3 border-t border-[#d8cabd] pt-5 sm:flex-row sm:justify-end">
                            <Button
                                onClick={() => setEditingDate(null)}
                                variant="outline"
                                size="medium"
                                disabled={submitting}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                Guardar cambios
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {completeDate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a16]/70 px-4 py-6 backdrop-blur-sm">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="complete-turno-title"
                    tabIndex={-1}
                    className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-[#cdbfae] bg-[#f8f3eb] shadow-[0_24px_70px_rgba(31,26,22,0.24)]"
                >
                <div className="flex flex-col">
                    <div className="border-b border-[#d8cabd] bg-[#eef3ec] px-6 py-6 sm:px-8">
                        <p className="text-sm font-semibold text-[#4f6d60]">
                                Completar turno
                        </p>
                        <h2 id="complete-turno-title" className="mt-2 text-2xl font-semibold tracking-tight text-[#1f1a16]">
                                ¿Desea completar el turno del {new Date(completeDate.date).toLocaleString("es-AR", { 
                                weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" 
                                })}?
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-[#5c4f44]">
                            Esta acción marcará la reserva como realizada.
                        </p>
                    </div>
                    <form className="flex w-full flex-col-reverse gap-3 p-6 sm:flex-row sm:justify-end sm:p-8" onSubmit={handleCompleteDateStatus}>
                        <Button
                            onClick={() => setCompleteDate(null)}
                            variant="outline"
                            size="medium"
                            disabled={submitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="secondary"
                            size="medium"
                            disabled={submitting}
                        >
                            Completar
                        </Button>
                    </form>
                </div>
                </div>
            </div>
        )}
    </>
  )
}

export default DateCard
