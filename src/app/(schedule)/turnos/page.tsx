import DatesForm from "@/components/dates-form";

export default async function SchedulesPage() {
    let datesData = [];
    let servicesData = [];

    const datesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule`, {
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


    const servicesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/service`, {
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