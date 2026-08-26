import { DateType } from "@/types/date";
import DateCard from "./date-card";
import FilterBar from "./filter-bar";
import { prisma } from "@/lib/prisma";

type Props = {
    datesQuery: string;
};

export default async function DatesList({ datesQuery }: Props) {
    let dates: DateType[] = []

    let clause = {
        status: {}
    };

    if (datesQuery === "completed") {
        clause = {
            status: "completado"
        }
    } else if (datesQuery === "confirmed") {
        clause = {
            status: "confirmado"
        }
    } else if (datesQuery === "all") {
        clause = {
            status: {
                in: ["completado", "confirmado"]
            }
        }
    }

    try {
        const schedules = await prisma.schedule.findMany({
            include: {user: true, service: true},
            orderBy: {date: "asc"},
            where: {
                ...clause,       
            }
        });

        if (!schedules) {
            console.error("Schedules not found");
        }

        dates = schedules;
    } catch (error) {
        console.error("Error fetching schedules:", error);
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-center sm:justify-start border-b border-[#d8cabd] pb-2">
                <FilterBar />
            </div>
            <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                <>
                    {dates && (
                        dates.map((date: DateType) => (
                            <DateCard key={date.id} date={date} dates={dates} />
                        ))
                    )}
                </>
            </div>
        </div>
    )
}