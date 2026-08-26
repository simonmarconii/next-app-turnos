import EmailTemplate from "@/components/email-template";
import { resend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function sendEmail(scheduleId: string) {
    const result = z.uuid().safeParse(scheduleId);

    if (!result.success) {
        return new Response(JSON.stringify({ error: "Turno no encontrado" }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    try {
        const existingSchedule = await prisma.schedule.findFirst({
            where: { id: scheduleId },
            include: {
                service: true,
                user: true,
            }
        })

        if (!existingSchedule) {
            return new Response(JSON.stringify({ error: "Turno no encontrado" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const realDate = new Date(existingSchedule.date);
        const date = realDate.toLocaleDateString("es-AR", { year: "numeric", month: "numeric", day: "numeric", timeZone: "America/Argentina/Buenos_Aires" });
        const time = realDate.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" });

        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: [existingSchedule.user.email],
            subject: "Tu turno ha sido reservado.",
            react: EmailTemplate({
                name: existingSchedule.user.name,
                lastname: existingSchedule.user.lastname,
                date: date,
                time: time,
                serviceName: existingSchedule.service.name
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
        console.error("Error sending email:", error);
        return new Response(JSON.stringify({error: "Error interno del servidor"}), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}