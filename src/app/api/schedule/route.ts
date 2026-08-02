import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
    const body = await request.json();

    const {name, lastname, email, phone, date, time} = body;

    const realDate = new Date(date + "T" + time + ":00.000Z");

    let user = await prisma.user.findUnique({
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

    const newSchedule = await prisma.schedule.create({
        data: {
            date: realDate,
            user_id: user.id,
            service_id: "4be9d980-3396-4b20-995d-bda1811f492d"
        }
    })

    return new Response(JSON.stringify(newSchedule), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
    })
}