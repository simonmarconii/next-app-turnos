type Props = {
    searchParams: Promise<{
        id?: string;
    }>
};

export default async function ResumePage({ searchParams }: Props) {
    const { id } = await searchParams;

    if (!id) {
        return (
            <div>Turno no encontrado</div>
        )
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    const data = await response.json();

    if (data.error) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-2">
                <p className="text-4xl font-bold">404</p>
                <p className="text-3xl">{data.error}</p>
            </div> 
        )
    }

    const realDate = new Date(data.data.date);
    const date = realDate.toLocaleString("es-AR", { year: "numeric", month: "numeric", day: "numeric", timeZone: "America/Argentina/Buenos_Aires" });
    const time = realDate.toLocaleString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" });

    return (
        <main className="mx-auto h-full flex items-center justify-center max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className={`overflow-hidden rounded-[2rem] border border-[#cdbfae] bg-white/80 shadow-[0_24px_80px_rgba(44,30,18,0.12)] backdrop-blur`}>
                <div className="px-6 py-8 sm:px-8">
                    <div>
                        <p className="text-center text-xl font-medium text-[#1f1a16]">
                            {`¡Gracias por confirmar tu turno ${data.data.user.name}! Hemos recibido tu solicitud para el servicio ${data.data.service.name} el día ${date} a las ${time} .`}
                        </p>
                        <p className="text-center text-sm text-[#4d4037]"> 
                            Te enviaremos más información a tu correo electrónico: {data.data.user.email}. Por favor, revisá en spam si no lo ves en tu bandeja de entrada.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}