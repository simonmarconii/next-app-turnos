import { prisma } from "@/lib/prisma";

export async function releaseExpiredPendingSchedules() {
    const expiredSchedules = await prisma.schedule.findMany({
        where: {
            status: "pendiente",
            expires_in: { lt: new Date() },
        },
        select: { id: true },
    });

    if (expiredSchedules.length === 0) return;

    const ids = expiredSchedules.map((schedule) => schedule.id);

    await prisma.$transaction(async (tx) => {
        await tx.payment.deleteMany({ where: { schedule_id: { in: ids } } });
        await tx.schedule.deleteMany({ where: { id: { in: ids } } });
    });
}

export async function releasePendingSchedule(scheduleId: string) {
    await prisma.$transaction(async (tx) => {
        const schedule = await tx.schedule.findUnique({
            where: { id: scheduleId },
            select: { status: true },
        });

        if (!schedule || schedule.status !== "pendiente") return;

        await tx.payment.deleteMany({ where: { schedule_id: scheduleId } });
        await tx.schedule.delete({ where: { id: scheduleId } });
    });
}
