import { prisma } from "@/lib/prisma";
import { z } from "zod";

type RouteParams = {
    params: Promise<{ id?: string }>;
}

export async function GET(request: Request, context: RouteParams) {
    const { id } = await context.params;

    const parsedId = z.string().uuid().safeParse(id);
    
    if (!parsedId.success) {
        return new Response(JSON.stringify({ error: "Turno no encotrado" }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const schedule = await prisma.schedule.findUnique({
            where: { id },
            include: {
                service: true,
                user: true,
            }
        });

        if (!schedule) {
            return new Response(JSON.stringify({ error: "Turno no encontrado" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        return new Response(JSON.stringify({ data: schedule }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error("Error fetching schedule:", error);
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}