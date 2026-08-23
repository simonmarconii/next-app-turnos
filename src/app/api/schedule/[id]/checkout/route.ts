import { prisma } from "@/lib/prisma";
import mercadoPagoClient from "@/lib/mercadopago";
import { Preference } from "mercadopago";
import { z } from "zod";

const preferenceClient = new Preference(mercadoPagoClient);

type RouteParams = {
    params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteParams) {
    const { id } = await context.params;

    const result = z.string().uuid().safeParse(id);

    if (!result.success) {
        return new Response(JSON.stringify({ error: "Turno no encontrado" }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    try {
        const turno = await prisma.schedule.findUnique({
            where: { id },
            include: {
                service: true,
                user: true,
            }
        })

        if (!turno) {
            return new Response(JSON.stringify({ error: "Turno no encontrado" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const existingPayment = await prisma.payment.findFirst({
            where: { schedule_id: turno.id },
        })

        if (existingPayment?.external_payment_id) {
            const existingPreference = await preferenceClient.get({ preferenceId: existingPayment.external_payment_id });
            return new Response(JSON.stringify({
                data: {
                    init_point: existingPreference.init_point,
                    sandbox_init_point: existingPreference.sandbox_init_point,
                }
            }));
        }

        const preference = await preferenceClient.create({
            body: {
                items: [
                    {
                        id: turno.id,
                        title: turno.service.name,
                        quantity: 1,
                        unit_price: turno.service.price,
                        currency_id: "ARS",
                    }
                ],
                external_reference: turno.id,
                auto_return: "approved",
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_API_URL}/turnos/resumen?id=${turno.id}`,
                    failure: `${process.env.NEXT_PUBLIC_API_URL}/`,
                    pending: `${process.env.NEXT_PUBLIC_API_URL}/`
                },
                notification_url: `${process.env.NEXT_PUBLIC_API_URL}/api/webhooks/mercadopago`,
            }
        });

        await prisma.payment.upsert({
            where: { schedule_id: turno.id },
            create: {
                schedule_id: turno.id,
                amount: turno.service.price,
                external_payment_id: preference.id,
            }, 
            update: {
                external_payment_id: preference.id,
            }
        });

        return new Response(JSON.stringify({
            data: {
                init_point: preference.init_point,
                sandbox_init_point: preference.sandbox_init_point, 
            } 
        }));
    } catch (error) {
       console.error("Error al crear la preferencia de pago:", error);
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}