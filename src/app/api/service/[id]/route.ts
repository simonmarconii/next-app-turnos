import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { priceSchema } from "@/schemas/service";

type RouteParams = {
    params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, context: RouteParams) {
    const { id } = await context.params;

    const result = z.uuid().safeParse(id);

    if (!result.success) {
        return new Response(JSON.stringify({ error: "Servicio no encontrado" }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    try {
        const existingService = await prisma.service.findFirst({
            where: { id },
        })

        if (!existingService) {
            return new Response(JSON.stringify({ error: "Servicio no encontrado" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        await prisma.service.delete({
            where: {
                id
            }
        })
        
        return new Response(JSON.stringify({message: "Servicio eliminado correctamente"}), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error("Error deleting service:", error);
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

export async function PUT(request: Request, context: RouteParams) {
    const { id } = await context.params;
    const body = await request.json();

    const { price } = body;

    const result = priceSchema.safeParse(price);

    if (!result.success) {
        return new Response(JSON.stringify({ error: "Precio debe ser mayor a 0" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    try {
        const updatedService = await prisma.service.update({
            where: {
                id,
            },
            data: {
                price
            }
        })
        
        return new Response(JSON.stringify({message: "Servicio actualizado correctamente", data: updatedService}), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error("Error updating service:", error);
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}