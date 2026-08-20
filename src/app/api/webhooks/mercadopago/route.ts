import { prisma } from "@/lib/prisma";
import mercadoPagoClient from "@/lib/mercadopago";
import { Payment } from "mercadopago";
import { NextRequest } from "next/server";

const paymentClient = new Payment(mercadoPagoClient);

export async function POST(request: NextRequest) {
    const body: {data: {id: string}} = await request.json();

    const payment = await paymentClient.get({ id: body.data.id });

    if (payment.status === 'approved') {
        const updatedSchedule = await prisma.schedule.update({
            where: { id: payment.external_reference },
            data: {
                status: "confirmado",
                updated_at: new Date(),
            }
        });

        await prisma.payment.update({
            where: { id: payment.metadata?.payment_id, schedule_id: updatedSchedule.id },
            data: {
                status: "aprobado",
                updated_at: new Date(),
                payment_method: payment.payment_method?.type,
            }
        })

    } else if (payment.status === 'rejected') {
        const updatedSchedule = await prisma.schedule.delete({
            where: { id: payment.external_reference }
        });

        await prisma.payment.delete({
            where: { id: payment.metadata?.payment_id, schedule_id: updatedSchedule.id }
        });
    }

    return new Response(null, {
        status: 200,
    })
}