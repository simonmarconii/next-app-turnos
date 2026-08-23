import { prisma } from "@/lib/prisma";
import { dateSchema } from "@/schemas/schedule";

type RouteParams = {
    params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteParams) {
    const { id } = await context.params;

    const body = await request.json();
    const { date, time } = body;

    const result = dateSchema.safeParse({ date, time });

    if (!result.success) {
        return new Response(JSON.stringify({ error: result.error.flatten().fieldErrors }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    const realDate = new Date(`${date}T${time}:00.000Z`);

    try {
        await prisma.$transaction(async (tx) => {
            const existingSchedule = await tx.schedule.findFirst({
                where: { id },
            })

            if (!existingSchedule) return new Response(JSON.stringify({ error: "Turno no encontrado" }), { status: 404 });

            await tx.schedule.update({
                where: { id },
                data: {
                    date: realDate,
                    updated_at: new Date(),
                }
            })
        })

        return new Response(JSON.stringify({ message: "Fecha del turno actualizada correctamente" }), {
            status: 200,
        })
    } catch (error) {
        console.error("Error al actualizar la fecha del turno:", error);
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
            status: 500,
        })
    }
}