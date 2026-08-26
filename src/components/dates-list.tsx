import { DateType } from "@/types/date";
import DateCard from "./date-card";
import FilterBar from "./filter-bar";
import { getBaseUrl } from "@/lib/utils";

type Props = {
    datesQuery: string;
};

export default async function DatesList({ datesQuery }: Props) {
    const baseUrl = getBaseUrl();

    const response = await fetch(`${baseUrl}/api/admin/schedules?search_dates=${datesQuery}`, {
        cache: "no-store",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })

    const dates = await response.json();

    return (
        <div className="space-y-3">
            <div className="flex justify-center sm:justify-start border-b border-[#d8cabd] pb-2">
                <FilterBar />
            </div>
            <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                <>
                    {dates.data && (
                        dates.data.map((date: DateType) => (
                            <DateCard key={date.id} date={date} dates={dates.data} />
                        ))
                    )}
                </>
            </div>
        </div>
    )
}