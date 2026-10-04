import DatesForm from "@/components/dates-form";
import { prisma } from "@/lib/prisma";
import { DateType } from "@/lib/definitions";
import { ServiceType } from "@/lib/definitions";
import { getBookingDateRange } from "@/lib/booking-date-range";

export default async function SchedulesPage() {
    let servicesData: ServiceType[] = [];
    let datesData: DateType[] = [];
    let unavailablePeriods: { startDate: string; endDate: string }[] = [];

    try {
        const { today } = getBookingDateRange();
        const [services, schedules, periods] = await Promise.all([
            prisma.service.findMany(),
            prisma.schedule.findMany({
                include: { service: true },
                where: {
                    OR: [
                        { status: "confirmado" },
                        { status: "pendiente", expires_in: { gt: new Date() } },
                    ],
                },
            }),
            prisma.unavailable_period.findMany({
                where: { end_date: { gte: new Date(`${today}T00:00:00.000Z`) } },
                orderBy: { start_date: "asc" },
            }),
        ]);

        servicesData = services;
        datesData = schedules;
        unavailablePeriods = periods.map((period) => ({
            startDate: period.start_date.toISOString().slice(0, 10),
            endDate: period.end_date.toISOString().slice(0, 10),
        }));
    } catch (error) {
        console.error("Error fetching booking data:", error);
    }

    return (
        <DatesForm services={servicesData} dates={datesData} unavailablePeriods={unavailablePeriods} />
    );
}
