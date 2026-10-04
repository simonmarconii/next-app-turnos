interface EmailTemplateProps {
    name: string;
    lastname: string;
    date: string;
    time: string;
    serviceName: string;
    summaryUrl?: string;
    pending?: boolean;
}

export default function EmailTemplate({ name, lastname, date, time, serviceName, summaryUrl, pending = false }: EmailTemplateProps) {
    return (
        <div>
            <h1>¡Hola, {name} {lastname}!</h1>
            <p>{pending ? "Recibimos tu solicitud de turno" : "Tenes un turno reservado"} para el servicio {serviceName}</p>
            <p className="font-bold">Dia: {date}</p>
            <p className="font-bold">Hora: {time}</p>
            {summaryUrl && <p><a href={summaryUrl}>Ver los datos de tu turno</a></p>}
        </div>
    );
}
