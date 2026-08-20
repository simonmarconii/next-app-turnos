type Props = {
    searchParams: {
        serviceName: string;
        date: string;
        time: string;
        name: string;
        email: string;
    }
};

export default async function ConfirmationPage({ searchParams }: Props) {
    const { serviceName, date, time, name, email } = await searchParams;

    return (
        <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-32">
            <div className={`overflow-hidden rounded-[2rem] border border-[#cdbfae] bg-white/80 shadow-[0_24px_80px_rgba(44,30,18,0.12)] backdrop-blur`}>
                <div className="px-6 py-8 sm:px-8">
                    <div>
                        <p className="text-center text-lg font-medium text-[#1f1a16]">
                            {`¡Gracias por confirmar tu turno ${name}! Hemos recibido tu solicitud para el servicio "${serviceName}" el día ${date} a las ${time}.`}
                        </p>
                        <p className="text-center text-sm text-[#4d4037]"> 
                            Te enviaremos mas informacion a tu correo electrónico: {email}. Por favor, revisá en spam si no lo ves en tu bandeja de entrada.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}