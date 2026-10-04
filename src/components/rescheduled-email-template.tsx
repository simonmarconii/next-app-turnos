interface RescheduledEmailTemplateProps {
    name: string;
    lastname: string;
    date: string;
    time: string;
    serviceName: string;
    summaryUrl?: string;
}

export default function RescheduledEmailTemplate({
    name,
    lastname,
    date,
    time,
    serviceName,
    summaryUrl,
}: RescheduledEmailTemplateProps) {
    return (
        <div>
            <h1>¡Hola, {name} {lastname}!</h1>
            <p>Tu turno para el servicio {serviceName} fue reprogramado.</p>
            <p className="font-bold">Nuevo día: {date}</p>
            <p className="font-bold">Nuevo horario: {time}</p>
            {summaryUrl && <p><a href={summaryUrl}>Ver los datos de tu turno</a></p>}
        </div>
    );
}
