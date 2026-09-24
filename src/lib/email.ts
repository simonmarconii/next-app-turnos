import EmailTemplate from "@/components/email-template";
import { resend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";

export async function sendEmail(scheduleId: string) {
    const existingSchedule = await prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: {
                service: true,
                user: true,
            }
        });

    if (!existingSchedule) throw new Error("Turno no encontrado");

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

    if (error) throw new Error(error.message);

    return data;
}
