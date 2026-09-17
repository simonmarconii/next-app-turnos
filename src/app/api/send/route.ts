import { sendEmail } from "@/lib/email";
import { z } from "zod";

const sendSchema = z.object({
    scheduleId: z.string().uuid(),
});

export async function POST(request: Request) {
    const body = await request.json();
    const parsed = sendSchema.safeParse(body);

    if (!parsed.success) {
        return new Response(JSON.stringify({ error: "scheduleId inválido" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        });
    }

    const { scheduleId } = parsed.data;

    try {
        await sendEmail(scheduleId);

        return new Response(JSON.stringify({ message: "Correo electrónico enviado con éxito" }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        });
    } catch (error) {
        console.error("Error fetching schedules:", error);
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        })
    }
}
