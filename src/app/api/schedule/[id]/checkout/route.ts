import { prisma } from "@/lib/prisma";
import mercadoPagoClient from "@/lib/mercadopago";
import { Preference } from "mercadopago";

const preferenceClient = new Preference(mercadoPagoClient);

type RouteParams = {
    params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteParams) {
    const { id } = await context.params;

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

        const newPayment = await prisma.payment.create({
            data: {
                schedule_id: turno.id,
                amount: turno.service.price,
            }
        });

        if (!newPayment) {
            return new Response(JSON.stringify({ error: "Error al crear el pago" }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            })
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
                    success: `https://10ngs3l8-3000.brs.devtunnels.ms/`,
                    failure: `https://10ngs3l8-3000.brs.devtunnels.ms/`,
                    pending: `https://10ngs3l8-3000.brs.devtunnels.ms/`
                },
                notification_url: `https://10ngs3l8-3000.brs.devtunnels.ms/api/webhooks/mercadopago`,
                metadata: {
                    payment_id: newPayment.id,
                }
            }
        });

        if (!preference) {
            return new Response(JSON.stringify({ error: "Error al crear la preferencia de pago" }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        return new Response(JSON.stringify({
            data: {
                init_point: preference.init_point,
                sandbox_init_point: preference.sandbox_init_point, 
                payment_id: newPayment.id,
            } 
        }));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}