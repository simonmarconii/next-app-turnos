import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const services = await prisma.service.findMany();

        if (!services) {
            return new Response(JSON.stringify({ error: "No services found" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        return new Response(JSON.stringify({data: services}), {
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

export async function POST(request: Request) {
    const body = await request.json();

    const { name, price } = body;

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
        return new Response(JSON.stringify({ error }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}