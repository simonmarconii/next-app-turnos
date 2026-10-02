interface RescheduledEmailTemplateProps {
    name: string;
    lastname: string;
    date: string;
    time: string;
    serviceName: string;
}

export default function RescheduledEmailTemplate({
    name,
    lastname,
    date,
    time,
    serviceName,
}: RescheduledEmailTemplateProps) {
    return (
        <div>
            <h1>¡Hola, {name} {lastname}!</h1>
            <p>Tu turno para el servicio {serviceName} fue reprogramado.</p>
            <p className="font-bold">Nuevo día: {date}</p>
            <p className="font-bold">Nuevo horario: {time}</p>
        </div>
    );
}
