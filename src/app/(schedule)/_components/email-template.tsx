interface EmailTemplateProps {
    name: string;
    lastname: string;
    date: string;
    time: string;
}

export default function EmailTemplate({ name, lastname, date, time }: EmailTemplateProps) {
    return (
        <div>
            <h1>Hola, {name} {lastname}</h1>
            <p>Tu turno ha sido reservado para el {date} a las {time}.</p>
            <p>Gracias por confiar en nosotros.</p>
        </div>
    );
}