import { prisma } from "@/lib/prisma";

type RouteParams = {
    params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, context: RouteParams) {
    const { id } = await context.params;

    try {
        await prisma.service.delete({
            where: {
                id
            }
        })
        
        return new Response(JSON.stringify("Service deleted successfully"), {
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
        
        return new Response(JSON.stringify(updatedService), {
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