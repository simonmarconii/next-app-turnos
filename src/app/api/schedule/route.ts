import { prisma } from "@/lib/prisma";
import { scheduleSchema } from "@/schemas/schedule";

export async function POST(request: Request) {
    const body = await request.json();
    const parsed = scheduleSchema.safeParse(body);

    if (!parsed.success) {
        return new Response(JSON.stringify({ error: "Payload inválido" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        });
    }

    const { name, lastname, email, phone, date, time, serviceId, paymentMethod } = parsed.data;

    const realDate = new Date(`${date}T${time}:00.000Z`);
    if (Number.isNaN(realDate.getTime())) {
        return new Response(JSON.stringify({ error: "Fecha inválida" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        });
    }

    try {
        let user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
    
        if (!user) {
            user = await prisma.user.create({
                data: {
                    name,
                    lastname,
                    email,
                    phone
                }
            })
        }

        const tenMinutesLater = paymentMethod === "transferencia" ? new Date() : null;
        if (tenMinutesLater) {
            tenMinutesLater.setMinutes(tenMinutesLater.getMinutes() + 10);
        }

        const newSchedule = await prisma.schedule.create({
            data: {
                date: realDate,
                user_id: user.id,
                expires_in: tenMinutesLater,
                service_id: serviceId
            },
            include: {
                service: true
            }
        })

        if (paymentMethod !== "transferencia") {
            await prisma.payment.create({
                data: {
                    schedule_id: newSchedule.id,
                    amount: newSchedule.service.price,
                    payment_method: "in_person",
                }
            })

            await prisma.schedule.update({
                where: { id: newSchedule.id },
                data: {
                    status: "confirmado",
                    updated_at: new Date(),
                }
            })
        }
    
        return new Response(JSON.stringify({data: newSchedule}), {
            status: 201,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        })
    }
}

export async function GET() {
    try {
        const schedules = await prisma.schedule.findMany({
            include: { service: true },
            where: { 
                status: "confirmado",
            }
        });

        if (!schedules) {
            return new Response(JSON.stringify({ error: "Schedules not found" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        return new Response(JSON.stringify({data: schedules}), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        })
    } catch (error) {
        console.error("Error fetching schedules:", error);
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        })
    }
}
