import DatesForm from "@/components/dates-form";
import { getBaseUrl } from "@/lib/utils";

export default async function SchedulesPage() {
    let datesData = [];
    let servicesData = [];

    const baseUrl = getBaseUrl();

    const datesResponse = await fetch(`${baseUrl}/api/schedule`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!datesResponse.ok) {
        console.error("Failed to fetch dates:", datesResponse.statusText);
    } else {
        const data = await datesResponse.json();
        datesData = data.data ?? [];
    }


    const servicesResponse = await fetch(`${baseUrl}/api/service`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!servicesResponse.ok) {
        console.error("Failed to fetch services:", servicesResponse.statusText);
    } else {
        const data = await servicesResponse.json();
        servicesData = data.data ?? [];
    }

    return (
        <DatesForm services={servicesData} dates={datesData} />
    );
}