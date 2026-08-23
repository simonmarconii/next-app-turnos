import { prisma } from "@/lib/prisma";
import { serviceSchema } from "@/schemas/service";

export async function GET() {
    try {
        const services = await prisma.service.findMany();

        if (!services) {
            return new Response(JSON.stringify({ error: "Services not found" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        return new Response(JSON.stringify({data: services}), {
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

export async function POST(request: Request) {
    const body = await request.json();

    const { name, price } = body;

    const result = serviceSchema.safeParse({ name, price });

    if (!result.success) {
        return new Response(JSON.stringify({ error: result.error.flatten().fieldErrors }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    try {
        const newService = await prisma.service.create({
            data: {
                name,
                price
            }
        })

        return new Response(JSON.stringify({data: newService}), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error("Error creating service:", error);
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}