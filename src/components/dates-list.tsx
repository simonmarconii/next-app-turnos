import { DateType } from "@/lib/definitions";
import DateCard from "./date-card";
import FilterBar from "./filter-bar";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/../generated/prisma";

type Props = {
    datesQuery: string;
};

export default async function DatesList({ datesQuery }: Props) {
    let dates: DateType[] = [];
    const activeFilter = datesQuery === "confirmed" || datesQuery === "completed" || datesQuery === "all"
        ? datesQuery
        : "all";

    const clause: Prisma.scheduleWhereInput =
        activeFilter === "completed"
            ? { status: "completado" }
            : activeFilter === "confirmed"
                ? { status: "confirmado" }
                : activeFilter === "all"
                    ? { status: { in: ["completado", "confirmado"] } }
                    : {};

    try {
        const schedules = await prisma.schedule.findMany({
            include: {user: true, service: true},
            orderBy: {date: "asc"},
            where: {
                ...clause,
            }
        });

        dates = schedules as DateType[];
    } catch (error) {
        console.error("Error fetching schedules:", error);
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-center sm:justify-start border-b border-[#d8cabd] pb-2">
                <FilterBar activeFilter={activeFilter} />
            </div>
            <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                {dates.length > 0 ? (
                    dates.map((date: DateType) => (
                        <DateCard key={date!.id} date={date} dates={dates} />
                    ))
                ) : (
                    <div className="rounded-2xl border border-dashed border-[#cdbfae] bg-[#f8f3eb] px-5 py-8 text-center lg:col-span-2">
                        <p className="text-base font-semibold text-[#1f1a16]">No hay turnos en este filtro.</p>
                        <p className="mt-1 text-sm leading-6 text-[#5c4f44]">Cuando haya turnos disponibles, los vas a ver acá.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
