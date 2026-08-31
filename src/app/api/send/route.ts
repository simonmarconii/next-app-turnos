import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
    const body = await request.json();
    const { scheduleId } = body;

    try {
        await sendEmail(scheduleId);

        return new Response(JSON.stringify({ message: "Correo electrónico enviado con éxito" }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Error fetching schedules:", error);
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}