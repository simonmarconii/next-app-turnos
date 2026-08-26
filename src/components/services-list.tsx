import ServicesClient from "@/components/service-client";
import { getBaseUrl } from "@/lib/utils";

async function ServicesData() {
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/api/service`, {
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