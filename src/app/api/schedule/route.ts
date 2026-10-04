import { prisma } from "@/lib/prisma";
import { releaseExpiredPendingSchedules } from "@/lib/schedule-availability";
export async function GET() {
    try {
        await releaseExpiredPendingSchedules();
        const schedules = await prisma.schedule.findMany({
            include: { service: true },
            where: {
                OR: [
                    { status: "confirmado" },
                    { status: "pendiente", expires_in: { gt: new Date() } },
                ],
            },
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
