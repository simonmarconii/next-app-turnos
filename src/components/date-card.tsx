"use client";

import { DateType } from "@/types/date";
import Button from "./button";
import { FormEvent, useMemo, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Select from "./select";

function splitDateTime(raw: Date) {
    const normalized = raw.toISOString().replace("T", " ");
    const [datePart, timePart = ""] = normalized.split(" ");
    const time = timePart.slice(0, 5);
    return { datePart, time };
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
    const [editForm, setEditForm] = useState({ date: new Date(date.date).toISOString(), time: "", status: date.status });

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
            .map((d) => splitDateTime(d.date))
            .filter((d) => d.datePart === editForm.date)
            .map((d) => d.time);
    }, [dates, editForm.date]);

    function handleDateChange(value: string) {
        setEditForm((current) => ({ ...current, date: value, time: "" }));
    }

    function updateField(field: keyof FormData, value: string) {
        setEditForm((current) => ({ ...current, [field]: value }));
    }

    async function handleCompleteDateStatus(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!completeDate ) return;

        try {
            const response = await fetch(`/api/schedule/${completeDate.id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "completado" }),
            });

            if (!response.ok) {
                throw new Error("Failed to update date status");
            } else {
                setCompleteDate(null);
                router.refresh();
            }
        } catch (error) {
            throw new Error("Failed to update date status: " + error);
        }
    }

    /*async function handlePayDateStatus(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if ( !editingDate ) return;

        try {
            const response = await fetch(`/api/schedule/${editingDate.id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "confirmado" }),
            });

            if (!response.ok) {
                throw new Error("Failed to update date status");
            } else {
                setEditingDate(null);
                router.refresh();
            }
        } catch (error) {
            throw new Error("Failed to update date status: " + error);
        }
    }*/

    async function handleUpdateDate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!editingDate) return;
        if (!editForm.date && !editForm.time) return;

        try {
            const response = await fetch(`/api/schedule/${editingDate.id}/date`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    date: editForm.date,
                    time: editForm.time,
                }),
            });

            if (!response.ok) {
                console.error("Failed to update date:", response.statusText);
            } else {
                setEditingDate(null);
                router.refresh();
            }
        } catch (error) {
            throw new Error("Failed to update date: " + error);
        }
    }


  return (
    <>
        <div
            className="flex gap-2 sm:justify-between rounded-2xl border border-[#e4d6c8] bg-white px-4 py-3 shadow-sm"
        >
            <div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1f1a16]">
                        Dia:
                    </p>
                    <p className="text-sm font-medium text-[#1f1a16]">
                        {new Date(date.date).toLocaleString("es-AR", { weekday: "long", month: "long", day: "numeric", timeZone: "America/Argentina/Buenos_Aires" })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1f1a16]">
                        Hora:
                    </p>
                    <p className="text-sm font-medium text-[#1f1a16]">
                        {new Date(date.date).toLocaleString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1f1a16]">
                        Cliente:
                    </p>
                    <p className="text-sm font-medium text-[#1f1a16]">
                        {date.user.name} {date.user.lastname}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1f1a16]">
                        Servicio:
                    </p>
                    <p className="text-sm font-medium text-[#1f1a16]">
                        {date.service.name} - ${date.service.price}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1f1a16]">
                        Estado:
                    </p>
                    <p className="text-sm font-medium text-[#1f1a16]">
                        {date.status === "pendiente" && "Turno pendiente"}
                        {date.status === "confirmado" && "Turno confirmado"}
                        {date.status === "cancelado" && "Turno cancelado"}
                        {date.status === "completado" && "Turno completado"}
                    </p>
                </div>
            </div>
            <div className="">
                <div className="flex items-center flex-col sm:flex-row gap-4">
                    <Button size="small" disabled={date.status === "completado"} onClick={() => {
                        setEditingDate(date);
                        setEditForm({ date: date.date.toISOString(), time: "", status: date.status });
                    }}>
                        Editar
                    </Button>
                    <Button size="small" variant="secondary" disabled={date.status === "completado"} onClick={() => setCompleteDate(date)}>
                        <FaCheck className="text-xl" />
                    </Button>
                </div>
            </div>
        </div>

        {editingDate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a16]/60 px-4 py-6">
                <div className="w-full max-w-md rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb] p-6 shadow-[0_20px_50px_rgba(31,26,22,0.18)]">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
                                Editar turno
                            </p>
                            <h2 className="mt-2 text-lg font-semibold text-[#1f1a16]">
                                Turno del {new Date(editingDate.date).toLocaleString("es-AR", { 
                                    year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" 
                                })}
                            </h2>
                        </div>
                    </div>

                    <form className="mt-6 space-y-5" onSubmit={handleUpdateDate}>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-[#4d4037]">
                                Fecha
                            </label>
                            <input
                                type="date"
                                value={editForm.date}
                                onChange={(event) => handleDateChange(event.target.value)}
                                className="rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="time" className="text-sm font-medium text-[#4d4037]">
                                Horario
                            </label>
                            <Select>
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
                        <div className="flex justify-between gap-3 pt-2">
                            <Button
                                onClick={() => setEditingDate(null)}
                                variant="outline"
                                size="medium"
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">
                                Guardar cambios
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {completeDate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a16]/60 px-4 py-6">
                <div className="w-full max-w-md rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb] p-6 shadow-[0_20px_50px_rgba(31,26,22,0.18)]">
                <div className="flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
                                Completar turno
                            </p>
                            <h2 className="mt-2 text-lg font-semibold text-[#1f1a16]">
                                ¿Desea completar el turno del {new Date(completeDate.date).toLocaleString("es-AR", { 
                                weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" 
                                })}?
                            </h2>
                        </div>
                    </div>
                    <form className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center" onSubmit={handleCompleteDateStatus}>
                        <Button
                            onClick={() => setCompleteDate(null)}
                            variant="outline"
                            size="medium"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="secondary"
                            size="medium"
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