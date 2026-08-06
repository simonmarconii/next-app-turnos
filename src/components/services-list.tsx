import ServicesClient from "@/components/service-client";

async function ServicesData() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/service`, {
    cache: "no-store",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const services = await response.json();

  return <ServicesClient initialServices={services.data} />;
}

export default function ServicesList() {
  return (
    <div>
        <ServicesData />
    </div>
  );
}