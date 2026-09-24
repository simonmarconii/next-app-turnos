import { prisma } from "@/lib/prisma";
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
