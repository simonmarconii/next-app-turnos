import DatesList from "@/components/dates-list";
import ServicesList from "@/components/services-list";
import AddServiceForm from "@/components/add-service-form";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

type Props = {
    searchParams: {
        search_dates: string;
    }
};

export default async function AdminPage({ searchParams }: Props) {
    const { search_dates: datesQuery } = await searchParams;
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
            <div className="rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.06)] sm:p-8">
                <h1 className="text-3xl font-semibold text-[#1f1a16] sm:text-4xl">
                    Bienvenido, {user?.email}
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#4d4037]">
                    Gestioná los turnos y servicios de tu negocio desde este panel de administración.
                </p>
            </div>

            <div className="flex flex-col gap-2 rounded-[2rem] border border-[#d8cabd] bg-[#fdfaf5] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.04)]">
                <div className="flex flex-col items-center gap-1 md:flex-row md:gap-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
                        Turnos
                    </p>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
                        -
                    </p>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
                        Hoy: {new Date().toLocaleDateString("es-AR", { weekday: "long", month: "long", day: "numeric", timeZone: "America/Argentina/Buenos_Aires"})}
                    </p>
                </div>
                <DatesList datesQuery={datesQuery} />
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 rounded-[2rem] border border-[#d8cabd] bg-[#fdfaf5] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.04)]">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82] border-b border-[#d8cabd] pb-2">
                        Servicios disponibles
                    </p>
                    <ServicesList />
                </div>
                <AddServiceForm />
            </div>
        </div>
    )
}