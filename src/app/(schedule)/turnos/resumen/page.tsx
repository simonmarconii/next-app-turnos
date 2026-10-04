import { prisma } from "@/lib/prisma";
import { hashScheduleAccessToken } from "@/lib/schedule-access";
import { DateType } from "@/lib/definitions";

type Props = {
    searchParams: {
        token?: string;
    };
};

export default async function ResumePage({ searchParams }: Props) {
    const { token } = await searchParams;

    if (!token) {
        return (
            <div>Turno no encontrado</div>
        )
    }

    let datesData: DateType = null;

    try {
        const schedule = await prisma.schedule.findFirst({
            where: {
                access_token_hash: hashScheduleAccessToken(token),
                access_token_expires_at: { gt: new Date() },
            },
            include: {
                service: true,
                user: true,
            }
        });

        if (!schedule) {
            console.error("No schedule found");
        }

        datesData = schedule;
    } catch (error) {
        console.error("Error fetching schedule:", error);
    }

    if (!datesData) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-2">
                <p className="text-4xl font-bold">404</p>
                <p className="text-3xl">Turno no encontrado</p>
            </div> 
        )
    }

    const realDate = new Date(datesData.date);
    const date = realDate.toLocaleString("es-AR", { year: "numeric", month: "numeric", day: "numeric", timeZone: "America/Argentina/Buenos_Aires" });
    const time = realDate.toLocaleString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" });

    return (
        <main className="mx-auto h-full flex items-center justify-center max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className={`overflow-hidden rounded-[2rem] border border-[#cdbfae] bg-white/80 shadow-[0_24px_80px_rgba(44,30,18,0.12)] backdrop-blur`}>
                <div className="px-6 py-8 sm:px-8">
                    <div className="flex flex-col gap-4">
                        <p className="text-center text-2xl font-medium text-[#1f1a16]">
                           {`¡Gracias por confirmar tu turno ${datesData.user?.name}!`} 
                        </p>
                        <p className="text-xl text-center font-medium text-[#1f1a16]">
                            {`Hemos recibido tu solicitud para el servicio ${datesData.service?.name} el día ${date} a las ${time} .`}
                        </p>
                        <p className="text-center text-sm text-[#4d4037]"> 
                            Te enviaremos más información a tu correo electrónico: {datesData.user?.email}. Por favor, revisá en spam si no lo ves en tu bandeja de entrada.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
