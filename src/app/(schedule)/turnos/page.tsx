import DatesForm from "@/components/dates-form";
import { createClient } from "@/lib/supabase/client";

export default async function SchedulesPage() {
    const supabase = await createClient();

    let servicesData = [];
    let datesData = [];

    const { data: services, error: servicesError } = await supabase.from("service").select("*");

    if (servicesError) {
        console.error("Error fetching services:", servicesError.message);
    } else {
        servicesData = services;
    }

    const { data: dates, error: datesError } = await supabase.from("schedule").select("*");

    if (datesError) {
        console.error("Error fetching dates:", datesError.message);
    } else {
        datesData = dates;
    }

    return (
        <DatesForm services={servicesData} dates={datesData} />
    );
}