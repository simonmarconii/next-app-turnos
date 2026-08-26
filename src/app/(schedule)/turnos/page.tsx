import DatesForm from "@/components/dates-form";
import { prisma } from "@/lib/prisma";
import { DateType } from "@/types/date";
import { ServiceType } from "@/types/service";

export default async function SchedulesPage() {
    let servicesData: ServiceType[] = [];
    let datesData: DateType[] = [];

    try {
        const services = await prisma.service.findMany();

        if (!services) {
            console.error("No services found");
        }

        servicesData = services;
    } catch (error) {
        console.error("Error fetching services:", error);
    }

    try {
        const schedules = await prisma.schedule.findMany({
            include: { service: true },
            where: { 
                status: "confirmado",
            }
        });

        if (!schedules) {
            console.error("No schedules found");
        }

        datesData = schedules;
    } catch (error) {
        console.error("Error fetching schedules:", error);
    }

    return (
        <DatesForm services={servicesData} dates={datesData} />
    );
}