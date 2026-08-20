"use client";

import { DateType } from "@/types/date";
import Button from "./button";
import { FormEvent, useMemo, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Select from "./select";

function splitDateTime(raw: string) {
    const normalized = raw.replace("T", " ");
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
    "09:00",
    "11:00",
    "13:00",
    "15:00",
    "17:00",
];

type Props = {
    date: DateType;
    dates: DateType[];
}

function DateCard({ date, dates }: Props) {
    const [editingDate, setEditingDate] = useState<DateType | null>(null);
    const [deletingDate, setDeletingDate] = useState<DateType | null>( null);
    const [editForm, setEditForm] = useState({ date: new Date(date.date).toISOString(), time: "", status: date.status });

    const router = useRouter();
    
    const bookedTimesForSelectedDate = useMemo(() => {
        if (!editForm.date) return [];
        return dates
            .map((d) => splitDateTime(d.date))
            .filter((d) => d.datePart === editForm.date)
            .map((d) => d.time);
    }, [dates, editForm.date]);

    const availableTimeSlots = useMemo(() => {
        return timeSlots.filter((slot) => !bookedTimesForSelectedDate.includes(slot));
    }, [bookedTimesForSelectedDate]);

    function handleDateChange(value: string) {
        const bookedForThatDay = dates
            .map((d) => splitDateTime(d.date))
            .filter((d) => d.datePart === value)
            .map((d) => d.time);
        const stillAvailable = timeSlots.filter((slot) => !bookedForThatDay.includes(slot));

        if (value && stillAvailable.length === 0) {
            setEditForm((current) => ({ ...current, date: value, time: "" }));
            return;
        }

        setEditForm((current) => ({ ...current, date: value, time: "" }));
    }

    async function handleDeleteDate(dateId: string) {
        try {
            const response = await fetch(`/api/schedule/${dateId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete date");
            }

            setDeletingDate(null);
            router.refresh();
        } catch (error) {
            throw new Error("Failed to delete date: " + error);
        }
    }

    const isDayFull = editForm.date !== "" && availableTimeSlots.length === 0;

    function updateField(field: keyof FormData, value: string) {
        setEditForm((current) => ({ ...current, [field]: value }));
    }

    async function handleUpdateDate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!editingDate) return;
        if (!editForm.date || !editForm.status) return;

        try {
            const response = await fetch(`/api/schedule/${editingDate.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    date: editForm.date,
                    time: editForm.time,
                    status: editForm.status,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update date");
            }

            setEditingDate(null);
            router.refresh();
        } catch (error) {
            throw new Error("Failed to update date: " + error);
        }
    }


  return (
    <>
        <div
            className="flex justify-between rounded-2xl border border-[#e4d6c8] bg-white px-4 py-3 shadow-sm"
        >
            <div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1f1a16]">
                        Dia:
                    </p>
                    <p className="text-sm font-medium text-[#1f1a16]">
                        {new Date(date.date).toLocaleDateString("es-AR", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1f1a16]">
                        Hora:
                    </p>
                    <p className="text-sm font-medium text-[#1f1a16]">
                        {new Date(date.date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
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
                        {date.status === "pendiente_pago" && "Pendiente de pago"}
                        {date.status === "confirmado" && "Turno pago"}
                        {date.status === "cancelado" && "Turno cancelado"}
                        {date.status === "completado" && "Turno completado"}
                    </p>
                </div>
            </div>
            <div className="">
                <div className="flex items-center gap-4">
                    <Button size="small" onClick={() => {
                        setEditingDate(date);
                        setEditForm({ date: date.date, time: "", status: date.status });
                    }}>
                        Editar
                    </Button>
                    <Button size="small" variant="secondary" disabled={editForm.status === "pendiente_pago"} onClick={() => setDeletingDate(date)}>
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
                                Turno del {new Date(editingDate.date).toLocaleTimeString("es-AR", { 
                                    year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" 
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
                                    disabled={!editForm.date || isDayFull}
                                    className="block w-full appearance-none bg-transparent pr-8 outline-none"
                                >
                                    <option value="">Elegí un horario</option>
                                    {timeSlots.map((timeSlot) => {
                                        const isBooked = bookedTimesForSelectedDate.includes(timeSlot);
                                        return (
                                            <option
                                                key={timeSlot}
                                                value={timeSlot}
                                                disabled={isBooked}
                                            >
                                                {timeSlot} {isBooked ? "(no disponible)" : ""}
                                            </option>
                                        );
                                    })}
                                </select>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-[#4d4037]">
                                Estado
                            </label>
                            <Select>
                                <select
                                    id="status"
                                    name="status"
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({...editForm, 
                                        status: e.target.value as "pendiente_pago" | "confirmado" | "cancelado" | "completado"}
                                    )}
                                    className="block w-full appearance-none bg-transparent pr-8 outline-none"
                                >
                                    <option value="">Elegí un estado</option>
                                    <option value="pendiente_pago">Pendiente de pago</option>
                                    <option value="confirmado">Turno pago</option>
                                </select>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                onClick={() => setEditingDate(null)}
                                variant="outline"
                                size="medium"
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" size="medium">
                                Guardar cambios
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {deletingDate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a16]/60 px-4 py-6">
                <div className="w-full max-w-md rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb] p-6 shadow-[0_20px_50px_rgba(31,26,22,0.18)]">
                <div className="flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
                                Completar turno
                            </p>
                            <h2 className="mt-2 text-lg font-semibold text-[#1f1a16]">
                                ¿Desea completar el turno del {new Date(deletingDate.date).toLocaleTimeString("es-AR", { 
                                weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" 
                                })}?
                            </h2>
                        </div>
                    </div>
                    <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
                    <Button
                        onClick={() => setDeletingDate(null)}
                        variant="outline"
                        size="medium"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => handleDeleteDate(deletingDate.id)}
                        variant="secondary"
                        size="medium"
                    >
                        Completar
                    </Button>
                    </div>
                </div>
                </div>
            </div>
        )}
    </>
  )
}

export default DateCard