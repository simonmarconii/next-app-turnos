import { prisma } from "@/lib/prisma";
import mercadoPagoClient from "@/lib/mercadopago";
import { Payment, WebhookSignatureValidator } from "mercadopago";
import { NextRequest } from "next/server";
import { z } from "zod";
import EmailTemplate from "@/components/email-template";
import { formatEmailDateTime, sendEmail } from "@/lib/email";

const paymentClient = new Payment(mercadoPagoClient);

const webhookBodySchema = z.object({
    action: z.string().optional(),
    data: z.object({
        id: z.string().min(1),
    }),
});

const supportedActions = new Set(["payment.created", "payment.updated"]);

function jsonResponse(body: unknown, status: number) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
        },
    });
}

export async function POST(request: NextRequest) {
    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

    if (!secret) {
        console.error("MERCADO_PAGO_WEBHOOK_SECRET is not configured");
        return jsonResponse({ error: "Server misconfiguration" }, 500);
    }

    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");
    const dataId = new URL(request.url).searchParams.get("data.id");

    try {
        WebhookSignatureValidator.validate({
            xSignature,
            xRequestId,
            dataId,
            secret,
        });
    } catch {
        return jsonResponse({ error: "Invalid signature" }, 401);
    }

    let rawBody: unknown;
    try {
        rawBody = await request.json();
    } catch {
        return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    const parsedBody = webhookBodySchema.safeParse(rawBody);
    if (!parsedBody.success) {
        return jsonResponse({ error: "Invalid payload" }, 400);
    }

    const { action, data } = parsedBody.data;
    if (action && !supportedActions.has(action)) {
        return new Response(null, { status: 200 });
    }

    const eventKey = `${action ?? "payment"}:${data.id}`;

    try {
        const payment = await paymentClient.get({ id: data.id });
        const scheduleId = z.uuid().safeParse(payment.external_reference);

        if (!scheduleId.success) {
            return jsonResponse({ error: "Missing references" }, 400);
        }

        if (payment.status !== "approved" && payment.status !== "rejected") {
            return new Response(null, { status: 200 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const existingEvent = await tx.payment_webhook_event.findUnique({
                where: { event_key: eventKey },
            });

            const currentSchedule = await tx.schedule.findUnique({
                where: { id: scheduleId.data },
            });

            if (!currentSchedule) {
                if (!existingEvent) {
                    await tx.payment_webhook_event.create({
                        data: {
                            event_key: eventKey,
                            external_payment_id: data.id,
                            action,
                        },
                    });
                }
                return { sendEmail: false, eventId: existingEvent?.id };
            }

            if (existingEvent?.email_sent_at || (existingEvent && payment.status !== "approved")) {
                return { sendEmail: false, eventId: existingEvent.id };
            }

            if (payment.status === "approved") {
                if (currentSchedule.status !== "confirmado") {
                    await tx.schedule.update({
                        where: { id: scheduleId.data },
                        data: { status: "confirmado", updated_at: new Date() },
                    });

                }

                await tx.payment.update({
                    where: { schedule_id: scheduleId.data },
                    data: {
                        status: "aprobado",
                        updated_at: new Date(),
                        payment_method: payment.payment_method?.type,
                    },
                });

                const event = existingEvent ?? await tx.payment_webhook_event.create({
                    data: {
                        event_key: eventKey,
                        external_payment_id: data.id,
                        action,
                    },
                });

                return { sendEmail: !event.email_sent_at, eventId: event.id };
            }

            if (payment.status === "rejected" && currentSchedule.status !== "confirmado") {
                await tx.payment.deleteMany({ where: { schedule_id: scheduleId.data } });
                await tx.schedule.delete({ where: { id: scheduleId.data } });
            }

            const event = existingEvent ?? await tx.payment_webhook_event.create({
                data: {
                    event_key: eventKey,
                    external_payment_id: data.id,
                    action,
                    email_sent_at: new Date(),
                },
            });

            return { sendEmail: false, eventId: event.id };
        });

        if (result.sendEmail && result.eventId) {
            try {
                const schedule = await prisma.schedule.findUnique({
                    where: { id: scheduleId.data },
                    include: { service: true, user: true },
                });

                if (schedule) {
                    const { date, time } = formatEmailDateTime(schedule.date);
                    await sendEmail({
                        to: schedule.user.email,
                        subject: "Tu turno ha sido reservado.",
                        react: EmailTemplate({
                            name: schedule.user.name,
                            lastname: schedule.user.lastname,
                            date,
                            time,
                            serviceName: schedule.service.name,
                        }),
                    });
                }

                await prisma.payment_webhook_event.update({
                    where: { id: result.eventId },
                    data: { email_sent_at: new Date() },
                });
            } catch (emailError) {
                console.error("Error sending payment confirmation email:", emailError);
            }
        }

        return new Response(null, { status: 200, headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Error processing Mercado Pago webhook:", error);
        return jsonResponse({ error: "Internal server error" }, 500);
    }
}
