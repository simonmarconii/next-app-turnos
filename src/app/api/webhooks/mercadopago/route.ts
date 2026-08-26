import { prisma } from "@/lib/prisma";
import mercadoPagoClient from "@/lib/mercadopago";
import { Payment, WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago";
import { NextRequest } from "next/server";
import { sendEmail } from "@/lib/email";

const paymentClient = new Payment(mercadoPagoClient);

export async function POST(request: NextRequest) {

    const { searchParams } = new URL(request.url);

    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');
    const dataId = searchParams.get('data.id');

    const secret = process.env.MERCADO_PAGO_SECRET_KEY!;

    try {
        WebhookSignatureValidator.validate({
            xSignature,
            xRequestId,
            dataId,
            secret
        })
    } catch (error) {
        if (error instanceof InvalidWebhookSignatureError) {
            return new Response("Invalid signature", {
                status: 401,
            })
        }
    }

    const body: {data: {id: string}, action?: string} = await request.json();

    if (body.action && body.action !== "payment.created" && body.action !== "payment.updated") {
        return new Response("Action ignored", { status: 200 });
    }

    try {
        const payment = await paymentClient.get({ id: body.data.id });

        const scheduleId = payment.external_reference;

        if (!scheduleId) {
            return new Response("Missing references", { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            const currentSchedule = await tx.schedule.findUnique({
                where: { id: scheduleId }
            });

            if (!currentSchedule) return;

            if (currentSchedule.status === "confirmado") return;

            if (payment.status === 'approved') {
                await tx.schedule.update({
                    where: { id: scheduleId },
                    data: {
                        status: "confirmado",
                        updated_at: new Date(),
                    }
                });
        
                await tx.payment.update({
                    where: { schedule_id: scheduleId },
                    data: {
                        status: "aprobado",
                        updated_at: new Date(),
                        payment_method: payment.payment_method?.type,
                    }
                });

                await sendEmail(scheduleId);
            } else if (payment.status === 'rejected') {
                await tx.payment.deleteMany({
                    where: { schedule_id: scheduleId }
                });

                await tx.schedule.delete({
                    where: { id: scheduleId }
                });
            }
        });

        return new Response(null, { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return new Response(JSON.stringify({error: "Error interno del servidor"}), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}