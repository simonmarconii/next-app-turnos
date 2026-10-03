import { addMonths, format, isValid, parseISO } from "date-fns";

const BOOKING_TIME_ZONE = "America/Argentina/Buenos_Aires";

export type UnavailablePeriod = {
    startDate: string;
    endDate: string;
};

function getDateParts(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        timeZone: BOOKING_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date).reduce<Record<string, string>>((parts, part) => {
        if (part.type !== "literal") parts[part.type] = part.value;
        return parts;
    }, {});
}

export function getBookingDateRange() {
    const parts = getDateParts(new Date());
    const today = `${parts.year}-${parts.month}-${parts.day}`;
    const maxDate = format(addMonths(parseISO(today), 1), "yyyy-MM-dd");

    return { today, maxDate };
}

function isSunday(date: string) {
    return new Date(`${date}T12:00:00.000Z`).getUTCDay() === 0;
}

export function getBookingDateError(date: string, unavailablePeriods: UnavailablePeriod[] = []) {
    const { today, maxDate } = getBookingDateRange();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isValid(parseISO(date))) {
        return "La fecha seleccionada no es válida.";
    }

    if (date < today) return "La fecha debe ser desde hoy en adelante.";
    if (date > maxDate) return "Solo se pueden reservar turnos hasta dentro de un mes.";
    if (isSunday(date)) return "Los domingos no hay turnos disponibles.";

    const isUnavailable = unavailablePeriods.some((period) => (
        date >= period.startDate && date <= period.endDate
    ));
    if (isUnavailable) return "El profesional no está disponible en la fecha seleccionada.";

    return null;
}
