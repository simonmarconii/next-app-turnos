import EmailTemplate from "@/components/email-template";
import { resend } from "../../../../lib/resend";
import "dotenv/config";

export async function POST(request: Request) {
    const body = await request.json();

    const { email, name, lastname, date, time, serviceName } = body;

    if (!email || !name || !lastname || !date || !time) {
        return Response.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    try {
        // Con el email de prueba de resend solo se puede enviar a un email verificado, por eso se usa el email de prueba.
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: ["raulalfonsin123456789@gmail.com"],
            subject: "Tu turno ha sido reservado.",
            react: EmailTemplate({
                name,
                lastname,
                date,
                time,
                serviceName
            })
        });

        if (error) {
            return Response.json({
                error: error.message
            }, {
                status: error.statusCode || 500,
            })
        }

        return Response.json(
            {
                message: "Email sent successfully.",
                data,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error sending email:", error);

        return Response.json(
            {
                error: "An error occurred while sending the email.",
            },
            { status: 500 }
        );
    }
}