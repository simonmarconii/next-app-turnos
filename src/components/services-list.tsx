import ServicesClient from "@/components/service-client";
import { prisma } from "@/lib/prisma";
import { ServiceType } from "@/lib/definitions";

async function ServicesData() {
  let services: ServiceType[] = [];

  try {
    const servicesData = await prisma.service.findMany();

    if (!servicesData) {
      console.error("Services not found");
    }

    services = servicesData;
  } catch (error) {
    console.error("Error fetching services:", error);
  }

  return <ServicesClient initialServices={services} />;
}

export default function ServicesList() {
  return (
    <div>
      <ServicesData />
    </div>
  );
}
