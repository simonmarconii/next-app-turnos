"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { getBookingDateRange, type UnavailablePeriod } from "@/lib/booking-date-range";

type Props = {
    value: string;
    onChange: (value: string) => void;
    mode?: "booking" | "admin";
    minDate?: string;
    maxDate?: string | null;
    id?: string;
    ariaDescribedBy?: string;
    hasError?: boolean;
    unavailablePeriods?: UnavailablePeriod[];
};

function formatSelectedDate(value: string) {
    if (!value) return "Elegí una fecha";

    return format(parseISO(value), "EEEE d 'de' MMMM", { locale: es });
}

export default function DatePicker({ value, onChange, mode = "booking", minDate, maxDate, id, ariaDescribedBy, hasError = false, unavailablePeriods = [] }: Props) {
    const [open, setOpen] = useState(false);
    const { today, maxDate: bookingMaxDate } = getBookingDateRange();
    const resolvedMinDate = minDate ?? today;
    const resolvedMaxDate = maxDate !== undefined ? maxDate : mode === "booking" ? bookingMaxDate : null;
    const selected = value ? parseISO(value) : undefined;

    return (
        <div className="relative">
            <button
                type="button"
                id={id}
                onClick={() => setOpen((current) => !current)}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-describedby={ariaDescribedBy}
                data-invalid={hasError || undefined}
                className={`flex w-full items-center justify-between rounded-2xl border bg-white px-4 py-3 text-left text-sm text-[#1f1a16] outline-none transition hover:border-[#b56b49] focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15 ${hasError ? "border-[#b42318]" : "border-[#d8cabd]"}`}
            >
                <span className={value ? "capitalize" : "text-[#907968]"}>
                    {formatSelectedDate(value)}
                </span>
                <FaRegCalendarAlt className="text-xl text-[#7a5a46]" aria-hidden="true" />
            </button>

            {open && (
                <div
                    role="dialog"
                    aria-label="Elegir fecha del turno"
                    className="absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 rounded-[1.5rem] border border-[#d8cabd] bg-[#f8f3eb] p-3 shadow-[0_20px_50px_rgba(31,26,22,0.18)] sm:left-0 sm:translate-x-0"
                >
                    <DayPicker
                        mode="single"
                        locale={es}
                        selected={selected}
                        onSelect={(day) => {
                            if (!day) return;
                            onChange(format(day, "yyyy-MM-dd"));
                            setOpen(false);
                        }}
                        disabled={[
                            { before: parseISO(resolvedMinDate) },
                            ...(resolvedMaxDate ? [{ after: parseISO(resolvedMaxDate) }] : []),
                            ...(mode === "booking" ? [{ dayOfWeek: [0] as number[] }] : []),
                            ...unavailablePeriods.map((period) => ({
                                from: parseISO(period.startDate),
                                to: parseISO(period.endDate),
                            })),
                        ]}
                        startMonth={parseISO(resolvedMinDate)}
                        endMonth={resolvedMaxDate ? parseISO(resolvedMaxDate) : undefined}
                        classNames={{
                            today: "font-bold text-[#b56b49]",
                            selected: "!bg-[#b56b49] !text-white",
                            disabled: "!text-[#cdbfae]",
                            day: "h-9 w-9 rounded-full text-sm transition hover:bg-[#e6d7c8]",
                            weekday: "w-9 text-xs font-semibold uppercase text-[#907968]",
                            caption_label: "text-sm font-semibold capitalize text-[#1f1a16]",
                            button_previous: "rounded-full p-2 text-[#7a5a46] hover:bg-[#e6d7c8]",
                            button_next: "rounded-full p-2 text-[#7a5a46] hover:bg-[#e6d7c8]",
                        }}
                    />
                </div>
            )}
        </div>
    );
}
