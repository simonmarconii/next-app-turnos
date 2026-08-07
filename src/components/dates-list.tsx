import { DateType } from "@/types/date";
import DateCard from "./date-card";
import FilterBar from "./filter-bar";

type Props = {
    datesQuery: string;
};

export default async function DatesList({ datesQuery }: Props) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule?search_dates=${datesQuery}`, {
        cache: "no-store",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })

    const dates = await response.json();

    return (
        <div className="space-y-3">
            <div className="flex justify-end border-b border-[#d8cabd] pb-2">
                <FilterBar />
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <>
                    {dates.data && (
                        dates.data.map((date: DateType) => (
                            <DateCard key={date.id} date={date} />
                        ))
                    )}
                </>
            </div>
        </div>
    )
}