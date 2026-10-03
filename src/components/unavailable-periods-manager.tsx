"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./button";
import DatePicker from "./date-picker";
import { createUnavailablePeriod, deleteUnavailablePeriod } from "@/lib/actions";
import { getBookingDateRange, type UnavailablePeriod } from "@/lib/booking-date-range";

type Props = {
    initialPeriods: Array<UnavailablePeriod & { id: string; reason: string | null }>;
};

export default function UnavailablePeriodsManager({ initialPeriods }: Props) {
    const [periods, setPeriods] = useState(initialPeriods);
    const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" });
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    const { today } = getBookingDateRange();

    async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting) return;
        if (!form.startDate || !form.endDate) {
            setError("Elegí una fecha inicial y una fecha final.");
            return;
        }
        setSubmitting(true);
        setError(null);

        try {
            const result = await createUnavailablePeriod(form);
            if (!result.success) {
                setError(result.error);
                return;
            }

            setPeriods((current) => [
                ...current,
                {
                    id: result.data.id,
                    startDate: form.startDate,
                    endDate: form.endDate,
                    reason: form.reason.trim() || null,
                },
            ].sort((first, second) => first.startDate.localeCompare(second.startDate)));
            setForm({ startDate: "", endDate: "", reason: "" });
            router.refresh();
        } catch (createError) {
            console.error("Error al crear el bloqueo:", createError);
            setError("No se pudo guardar el período.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (submitting) return;
        setSubmitting(true);
        setError(null);

        try {
            const result = await deleteUnavailablePeriod(id);
            if (!result.success) {
                setError(result.error);
                return;
            }

            setPeriods((current) => current.filter((period) => period.id !== id));
            router.refresh();
        } catch (deleteError) {
            console.error("Error al eliminar el bloqueo:", deleteError);
            setError("No se pudo eliminar el período.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <form className="border-b border-[#d8cabd] pb-6" onSubmit={handleCreate}>
                <h3 className="text-lg font-semibold text-[#1f1a16]">Agregar días no disponibles</h3>
                <p className="mt-1 text-sm leading-6 text-[#5c4f44]">
                    Bloqueá uno o varios días por vacaciones, descanso u otro motivo.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <label htmlFor="unavailable-start" className="text-sm font-semibold text-[#4d4037]">Desde</label>
                        <DatePicker
                            id="unavailable-start"
                            mode="admin"
                            minDate={today}
                            value={form.startDate}
                            onChange={(value) => setForm((current) => ({
                                ...current,
                                startDate: value,
                                endDate: current.endDate && current.endDate < value ? "" : current.endDate,
                            }))}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="unavailable-end" className="text-sm font-semibold text-[#4d4037]">Hasta</label>
                        <DatePicker
                            id="unavailable-end"
                            mode="admin"
                            minDate={form.startDate || today}
                            value={form.endDate}
                            onChange={(value) => setForm((current) => ({ ...current, endDate: value }))}
                        />
                    </div>
                </div>

                <div className="mt-4 grid gap-2">
                    <label htmlFor="unavailable-reason" className="text-sm font-semibold text-[#4d4037]">Motivo (opcional)</label>
                    <input
                        id="unavailable-reason"
                        type="text"
                        maxLength={120}
                        value={form.reason}
                        onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                        placeholder="Vacaciones"
                        className="rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                    />
                </div>

                <div className="mt-4 flex justify-end">
                    <Button type="submit" disabled={submitting}>
                        {submitting ? "Guardando..." : "Bloquear fechas"}
                    </Button>
                </div>
                {error && <p role="alert" className="mt-3 text-sm text-[#b42318]">{error}</p>}
            </form>

            <div className="grid gap-3">
                <h3 className="text-lg font-semibold text-[#1f1a16]">Períodos bloqueados</h3>
                {periods.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-[#cdbfae] bg-[#f8f3eb] px-4 py-5 text-sm text-[#5c4f44]">
                        No hay fechas bloqueadas.
                    </p>
                ) : (
                    periods.map((period) => (
                        <div key={period.id} className="flex flex-col gap-3 rounded-2xl border border-[#d8cabd] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-semibold text-[#1f1a16]">
                                    {format(parseISO(period.startDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                                    {period.startDate !== period.endDate && (
                                        <> hasta {format(parseISO(period.endDate), "d 'de' MMMM 'de' yyyy", { locale: es })}</>
                                    )}
                                </p>
                                {period.reason && <p className="mt-1 text-sm text-[#5c4f44]">{period.reason}</p>}
                            </div>
                            <Button type="button" variant="destructive" size="small" disabled={submitting} onClick={() => handleDelete(period.id)}>
                                Eliminar
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
