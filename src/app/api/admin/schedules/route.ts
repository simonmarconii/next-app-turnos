import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("search_dates") || "confirmed";

    let clause = {
        status: {}
    };

    if (query === "completed") {
        clause = {
            status: "completado"
        }
    } else if (query === "confirmed") {
        clause = {
            status: "confirmado"
        }
    } else if (query === "all") {
        clause = {
            status: {
                in: ["completado", "confirmado"]
            }
        }
    }

    try {
        const schedules = await prisma.schedule.findMany({
            include: {user: true, service: true},
            orderBy: {date: "asc"},
            where: {
                ...clause,       
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
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error("Error fetching schedules:", error);
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}