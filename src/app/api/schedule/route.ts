import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

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
    
        return new Response(JSON.stringify({data: newSchedule}), {
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

type CluseType = {
    date: {
        gte?: Date;
        lt?: Date;
    }
}

export async function GET(request: NextRequest) {

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("search_dates") || "upcoming";

    let clause: CluseType = {
        date: {
            gte: new Date()
        }
    };
    if (query === "past") {
        clause = {
            date: {
                lt: new Date()
            }
        }
    } else if (query === "all") {
        clause = {
            date: {}
        }
    }

    try {
        const schedules = await prisma.schedule.findMany({
            include: {user: true, service: true},
            orderBy: {date: "asc"},
            where: clause
        });

        if (!schedules) {
            return new Response(JSON.stringify({ error: "No schedules found" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        return new Response(JSON.stringify({data: schedules}), {
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