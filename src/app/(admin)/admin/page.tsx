import DatesList from "@/components/dates-list";
import ServicesList from "@/components/services-list";
import AddServiceForm from "@/components/add-service-form";
import { requireAdmin } from "@/lib/auth";
import UnavailablePeriodsManager from "@/components/unavailable-periods-manager";
import { getBookingDateRange } from "@/lib/booking-date-range";
import { prisma } from "@/lib/prisma";

async function prismaUnavailablePeriods(today: string) {
    const periods = await prisma.unavailable_period.findMany({
        where: { end_date: { gte: new Date(`${today}T00:00:00.000Z`) } },
        orderBy: { start_date: "asc" },
    });

    return periods.map((period) => ({
        id: period.id,
        startDate: period.start_date.toISOString().slice(0, 10),
        endDate: period.end_date.toISOString().slice(0, 10),
        reason: period.reason,
    }));
}

type Props = {
    searchParams: {
        search_dates: string;
    }
};

export default async function AdminPage({ searchParams }: Props) {
    const { search_dates: datesQuery } = await searchParams;
    const user = await requireAdmin();
    const { today } = getBookingDateRange();
    const unavailablePeriods = await prismaUnavailablePeriods(today);

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
            <header className="rounded-[2rem] border border-[#cdbfae] bg-[#f8f3eb] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.06)] sm:p-8">
                <p className="text-sm font-semibold text-[#4f6d60]">Panel de gestión</p>
                <h1 className="mt-2 text-3xl font-semibold text-[#1f1a16] sm:text-4xl">
                    Bienvenido, {user?.email}
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#4d4037]">
                    Gestioná los turnos y servicios de tu negocio desde este panel de administración.
                </p>
            </header>

            <section className="flex flex-col gap-4 rounded-[2rem] border border-[#cdbfae] bg-[#fdfaf5] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.04)]">
                <div className="flex flex-col gap-2 border-b border-[#d8cabd] pb-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-[#1f1a16]">Turnos</h2>
                        <p className="mt-1 text-sm text-[#5c4f44]">
                            Gestioná las reservas confirmadas y completadas.
                        </p>
                    </div>
                    <p className="text-sm font-medium capitalize text-[#4f6d60]">
                        Hoy: {new Date().toLocaleDateString("es-AR", { weekday: "long", month: "long", day: "numeric", timeZone: "America/Argentina/Buenos_Aires"})}
                    </p>
                </div>
                <DatesList datesQuery={datesQuery} />
            </section>

            <section className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 rounded-[2rem] border border-[#cdbfae] bg-[#fdfaf5] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.04)]">
                    <h2 className="border-b border-[#cdbfae] pb-3 text-2xl font-semibold text-[#1f1a16]">
                        Servicios disponibles
                    </h2>
                    <AddServiceForm />
                    <ServicesList />
                </div>
                <div className="rounded-[2rem] border border-[#cdbfae] bg-[#fdfaf5] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.04)]">
                    <h2 className="border-b border-[#cdbfae] pb-3 text-2xl font-semibold text-[#1f1a16]">
                        Disponibilidad
                    </h2>
                    <div className="mt-5">
                        <UnavailablePeriodsManager initialPeriods={unavailablePeriods} />
                    </div>
                </div>
            </section>
        </div>
    )
}
