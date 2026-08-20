import { prisma } from "@/lib/prisma";

type RouteParams = {
    params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, context: RouteParams) {
    const { id } = await context.params;

    try {
        const existingService = await prisma.service.findFirst({
            where: { id },
        })

        if (!existingService) {
            return new Response(JSON.stringify({ error: "Service not found" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        await prisma.service.delete({
            where: {
                id
            }
        })
        
        return new Response(JSON.stringify({message: "Service deleted successfully"}), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

export async function PUT(request: Request, context: RouteParams) {
    const { id } = await context.params;
    const body = await request.json();

    const { price } = body;

    try {
        const updatedService = await prisma.service.update({
            where: {
                id,
            },
            data: {
                price
            }
        })
        
        return new Response(JSON.stringify({message: "Service updated successfully", data: updatedService}), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}