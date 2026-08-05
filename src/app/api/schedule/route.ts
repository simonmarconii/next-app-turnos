import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const body = await request.json();

    const {name, lastname, email, phone, date, time, serviceId} = body;

    const realDate = new Date(date + "T" + time + ":00.000Z");

    try {
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
                service_id: serviceId
            }
        })
    
        return new Response(JSON.stringify(newSchedule), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        return new Response(JSON.stringify({ error }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

export async function GET() {
    try {
        const schedules = await prisma.schedule.findMany({
            include: {user: true, service: true},
            orderBy: {date: "asc"}
        });

        if (!schedules) {
            return new Response(JSON.stringify({ error: "No schedules found" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        return new Response(JSON.stringify(schedules), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        return new Response(JSON.stringify({ error }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}