import { prisma } from "@/lib/prisma";

type RouteParams = {
    params: Promise<{ id: string }>;
}

export async function PUT( request: Request, context: RouteParams ) {
    const { id } = await context.params;

    const body = await request.json();
    const { date, time, status } = body;

    const realDate = new Date(date + "T" + time + ":00.000Z");

    try {
        const existingDate = await prisma.schedule.findFirst({
            where: { id },
        })

        if (!existingDate) {
            return new Response(JSON.stringify({ error: "Date not found" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const updatedDate = await prisma.schedule.update({
            where: { id },
            data: {
                ...((date && time) && { date: realDate }),
                ...(status && { status }),
            }
        })

        return new Response(JSON.stringify({data: updatedDate}), {
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

export async function DELETE( request: Request, context: RouteParams ) {
    const { id } = await context.params;

    try {
        const existingDate = await prisma.schedule.findFirst({
            where: { id },
        })

        if (!existingDate) {
            return new Response(JSON.stringify({ error: "Date not found" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const existingPayment = await prisma.payment.findFirst({
            where: { schedule_id: existingDate.id },
        })

        if (!existingPayment) {
            return new Response(JSON.stringify({ error: "Payment not found for this date" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        await prisma.payment.delete({
            where: { id: existingPayment.id },
        })

        const deletedDate = await prisma.schedule.delete({
            where: { id: existingDate.id },
        })

        return new Response(JSON.stringify({message: "Date deleted successfully", data: deletedDate}), {
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