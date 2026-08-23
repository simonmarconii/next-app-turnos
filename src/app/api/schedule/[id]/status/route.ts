import { prisma } from "@/lib/prisma";
import { z } from "zod";

type RouteParams = {
    params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteParams) {
    const { id } = await context.params;

    const body = await request.json();
    const { status } = body;

    const result = z.enum(["confirmado", "completado", "cancelado"]).safeParse(status);

    if (!result.success) {
        return new Response(JSON.stringify({ error: "Estado invalido" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        await prisma.$transaction(async (tx) => {
            const existingSchedule = await tx.schedule.findFirst({
                where: { id },
            })

            if (!existingSchedule) return new Response(JSON.stringify({ error: "Turno no encontrado" }), { status: 404 });

            await tx.schedule.update({
                where: { id },
                data: {
                    status,
                    updated_at: new Date(),
                }
            })

            if (status === "completado" && existingSchedule.expires_in === null) {
                await tx.payment.update({
                    where: { schedule_id: existingSchedule.id },
                    data: {
                        status: "aprobado",
                        updated_at: new Date(),
                    }
                })
            }
        })

        return new Response(JSON.stringify({ message: "Estado del turno actualizado correctamente" }), {
            status: 200,
        })
    } catch (error) {
        console.error("Error al actualizar el estado del turno:", error);
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
            status: 500,
        })
    }
}