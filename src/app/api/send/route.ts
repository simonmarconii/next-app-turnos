import EmailTemplate from "@/components/email-template";
import { resend } from "@/lib/resend";
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
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: [email],
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
            return new Response(JSON.stringify({
                error: error.message
            }), {
                status: error.statusCode || 500,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        return new Response(JSON.stringify({ message: "Email sent successfully.", data }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(JSON.stringify({error: errorMessage}), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}