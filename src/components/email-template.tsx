interface EmailTemplateProps {
    name: string;
    lastname: string;
    date: string;
    time: string;
    serviceName: string;
}

export default function EmailTemplate({ name, lastname, date, time, serviceName }: EmailTemplateProps) {
    return (
        <div>
            <h1>¡Hola, {name} {lastname}!</h1>
            <p>Tenes un turno reservado para el servicio {serviceName}</p>
            <p className="font-bold">Dia: {date}</p>
            <p className="font-bold">Hora: {time}</p>
        </div>
    );
}