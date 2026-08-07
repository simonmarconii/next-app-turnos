import DatesForm from "@/components/dates-form";

export default async function SchedulesPage() {
    const datesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule`, {
        cache: "no-cache",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!datesResponse.ok) {
        throw new Error("Failed to fetch dates");
    }

    const datesData = await datesResponse.json();

    const servicesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/service`, {
        cache: "no-cache",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!servicesResponse.ok) {
        throw new Error("Failed to fetch services");
    }

    const servicesData = await servicesResponse.json();

    return (
        <DatesForm services={servicesData.data} dates={datesData.data} />
    );
}