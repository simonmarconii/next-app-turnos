"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Preference } from "mercadopago";
import { z } from "zod";
import { isValid, parseISO } from "date-fns";
import EmailTemplate from "@/components/email-template";
import RescheduledEmailTemplate from "@/components/rescheduled-email-template";
import { prisma } from "@/lib/prisma";
import mercadoPagoClient from "@/lib/mercadopago";
import { createClient } from "@/lib/supabase/server";
import { formatEmailDateTime, sendEmail } from "@/lib/email";
import { dateSchema, scheduleSchema } from "@/schemas/schedule";
import { priceSchema, serviceSchema } from "@/schemas/service";
import { userLoginSchema } from "@/schemas/user";
import { unavailablePeriodSchema } from "@/schemas/unavailable-period";
import { getBookingDateError, getBookingDateRange } from "@/lib/booking-date-range";
import { requireAdmin } from "./auth";
import { releaseExpiredPendingSchedules, releasePendingSchedule } from "@/lib/schedule-availability";

type ActionResult<T = undefined> =
    | { success: true; data: T }
    | { success: false; error: string; fieldErrors?: Record<string, string[]> };

const preferenceClient = new Preference(mercadoPagoClient);

async function hasUnavailablePeriod(date: string) {
    const day = new Date(`${date}T00:00:00.000Z`);
    const period = await prisma.unavailable_period.findFirst({
        where: {
            start_date: { lte: day },
            end_date: { gte: day },
        },
    });

    return Boolean(period);
}

function actionError(error: unknown): ActionResult<never> {
    console.error(error);
    return { success: false, error: "Error interno del servidor" };
}

export async function createSchedule(input: unknown): Promise<ActionResult<{ id: string }>> {
    const parsed = scheduleSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: "Payload inválido",
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    const { name, lastname, email, phone, date, time, serviceId, paymentMethod } = parsed.data;
    const realDate = new Date(`${date}T${time}:00.000Z`);

    if (Number.isNaN(realDate.getTime())) {
        return { success: false, error: "Fecha inválida" };
    }

    const bookingDateError = getBookingDateError(date);
    if (bookingDateError) return { success: false, error: bookingDateError };

    try {
        await releaseExpiredPendingSchedules();

        if (await hasUnavailablePeriod(date)) {
            return { success: false, error: "El profesional no está disponible en la fecha seleccionada." };
        }

        const expiresIn = paymentMethod === "transferencia" ? new Date() : null;
        if (expiresIn) expiresIn.setMinutes(expiresIn.getMinutes() + 10);

        const newSchedule = await prisma.$transaction(async (tx) => {
            const service = await tx.service.findUniqueOrThrow({ where: { id: serviceId } });
            let user = await tx.user.findFirst({ where: { email } });

            if (!user) {
                user = await tx.user.create({
                    data: { name, lastname, email, phone },
                });
            }

            const schedule = await tx.schedule.create({
                data: {
                    date: realDate,
                    user_id: user.id,
                    expires_in: expiresIn,
                    service_id: service.id,
                },
            });

            if (paymentMethod !== "transferencia") {
                await tx.payment.create({
                    data: {
                        schedule_id: schedule.id,
                        amount: service.price,
                        payment_method: "in_person",
                    },
                });

                await tx.schedule.update({
                    where: { id: schedule.id },
                    data: { status: "confirmado", updated_at: new Date() },
                });
            }

            return tx.schedule.findUniqueOrThrow({
                where: { id: schedule.id },
                include: { service: true, user: true },
            });
        });

        // El envío forma parte del flujo de reserva, pero su implementación
        // está aislada para poder reutilizarla desde otras features.
        if (paymentMethod !== "transferencia") {
            try {
                const { date, time } = formatEmailDateTime(newSchedule.date);
                await sendEmail({
                    to: newSchedule.user.email,
                    subject: "Tu turno ha sido reservado.",
                    react: EmailTemplate({
                        name: newSchedule.user.name,
                        lastname: newSchedule.user.lastname,
                        date,
                        time,
                        serviceName: newSchedule.service.name,
                    }),
                });
            } catch (error) {
                // El turno ya fue creado; un fallo del proveedor de email no
                // debe convertir una reserva válida en una reserva fallida.
                console.error("Error al enviar el email de confirmación:", error);
            }
        }

        return { success: true, data: { id: newSchedule.id } };
    } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "P2002") {
            return { success: false, error: "El horario seleccionado ya no está disponible." };
        }
        return actionError(error);
    }
}

export async function createCheckout(scheduleId: string): Promise<ActionResult<{ initPoint: string }>> {
    const parsedId = z.uuid().safeParse(scheduleId);
    if (!parsedId.success) return { success: false, error: "Turno no encontrado" };

    try {
        const schedule = await prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: { service: true, user: true },
        });

        if (!schedule) return { success: false, error: "Turno no encontrado" };

        const existingPayment = await prisma.payment.findFirst({
            where: { schedule_id: schedule.id },
        });

        if (existingPayment?.external_payment_id) {
            const existingPreference = await preferenceClient.get({
                preferenceId: existingPayment.external_payment_id,
            });
            return {
                success: true,
                data: { initPoint: existingPreference.init_point ?? existingPreference.sandbox_init_point ?? "" },
            };
        }

        const preference = await preferenceClient.create({
            body: {
                items: [{
                    id: schedule.id,
                    title: schedule.service.name,
                    quantity: 1,
                    unit_price: schedule.service.price,
                    currency_id: "ARS",
                }],
                external_reference: schedule.id,
                auto_return: "approved",
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_API_URL}/turnos/resumen?id=${schedule.id}`,
                    failure: `${process.env.NEXT_PUBLIC_API_URL}/`,
                    pending: `${process.env.NEXT_PUBLIC_API_URL}/`,
                },
                notification_url: `${process.env.NEXT_PUBLIC_API_URL}/api/webhooks/mercadopago`,
            },
        });

        await prisma.payment.upsert({
            where: { schedule_id: schedule.id },
            create: {
                schedule_id: schedule.id,
                amount: schedule.service.price,
                external_payment_id: preference.id,
            },
            update: { external_payment_id: preference.id },
        });

        return {
            success: true,
            data: { initPoint: preference.init_point ?? preference.sandbox_init_point ?? "" },
        };
    } catch (error) {
        await releasePendingSchedule(scheduleId).catch((cleanupError) => {
            console.error("Error al liberar el turno pendiente:", cleanupError);
        });
        return actionError(error);
    }
}

export async function rescheduleSchedule(
    scheduleId: string,
    input: unknown,
): Promise<ActionResult<{ emailSent: boolean }>> {
    await requireAdmin();

    const parsedId = z.uuid().safeParse(scheduleId);
    const parsed = dateSchema.safeParse(input);

    if (!parsedId.success) return { success: false, error: "Turno no encontrado" };
    if (!parsed.success) {
        return {
            success: false,
            error: "Fecha inválida",
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    const realDate = new Date(`${parsed.data.date}T${parsed.data.time}:00.000Z`);
    if (Number.isNaN(realDate.getTime())) return { success: false, error: "Fecha inválida" };

    const bookingDateError = getBookingDateError(parsed.data.date);
    if (bookingDateError) return { success: false, error: bookingDateError };

    try {
        if (await hasUnavailablePeriod(parsed.data.date)) {
            return { success: false, error: "El profesional no está disponible en la fecha seleccionada." };
        }

        await prisma.$transaction(async (tx) => {
            const schedule = await tx.schedule.findUnique({ where: { id: scheduleId } });
            if (!schedule) throw new Error("Turno no encontrado");

            await tx.schedule.update({
                where: { id: scheduleId },
                data: { date: realDate, updated_at: new Date() },
            });
        });

        try {
            const schedule = await prisma.schedule.findUnique({
                where: { id: scheduleId },
                include: { service: true, user: true },
            });

            if (!schedule) throw new Error("Turno no encontrado");

            const { date, time } = formatEmailDateTime(schedule.date);
            await sendEmail({
                to: schedule.user.email,
                subject: "Tu turno fue reprogramado.",
                react: RescheduledEmailTemplate({
                    name: schedule.user.name,
                    lastname: schedule.user.lastname,
                    date,
                    time,
                    serviceName: schedule.service.name,
                }),
            });
            return { success: true, data: { emailSent: true } };
        } catch (error) {
            console.error("Error al enviar el email de reprogramación:", error);
            return { success: true, data: { emailSent: false } };
        }
    } catch (error) {
        if (error instanceof Error && error.message === "Turno no encontrado") {
            return { success: false, error: error.message };
        }
        return actionError(error);
    }
}

export async function createUnavailablePeriod(input: unknown): Promise<ActionResult<{ id: string }>> {
    await requireAdmin();

    const parsed = unavailablePeriodSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error: "Datos inválidos",
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    const { startDate, endDate, reason } = parsed.data;
    const { today } = getBookingDateRange();

    if (!isValid(parseISO(startDate)) || !isValid(parseISO(endDate))) {
        return { success: false, error: "Las fechas no son válidas" };
    }
    if (startDate < today) return { success: false, error: "La fecha inicial no puede estar en el pasado" };
    if (endDate < startDate) return { success: false, error: "La fecha final debe ser posterior o igual a la inicial" };

    try {
        const period = await prisma.unavailable_period.create({
            data: {
                start_date: new Date(`${startDate}T00:00:00.000Z`),
                end_date: new Date(`${endDate}T00:00:00.000Z`),
                reason: reason || null,
            },
        });

        revalidatePath("/admin");
        revalidatePath("/turnos");
        return { success: true, data: { id: period.id } };
    } catch (error) {
        return actionError(error);
    }
}

export async function deleteUnavailablePeriod(periodId: string): Promise<ActionResult> {
    await requireAdmin();
    const parsedId = z.uuid().safeParse(periodId);
    if (!parsedId.success) return { success: false, error: "Bloqueo no encontrado" };

    try {
        await prisma.unavailable_period.delete({ where: { id: periodId } });
        revalidatePath("/admin");
        revalidatePath("/turnos");
        return { success: true, data: undefined };
    } catch (error) {
        return actionError(error);
    }
}

export async function updateScheduleStatus(
    scheduleId: string,
    status: "confirmado" | "completado" | "cancelado",
): Promise<ActionResult> {
    await requireAdmin();
    const parsedId = z.uuid().safeParse(scheduleId);
    const parsedStatus = z.enum(["confirmado", "completado", "cancelado"]).safeParse(status);

    if (!parsedId.success) return { success: false, error: "Turno no encontrado" };
    if (!parsedStatus.success) return { success: false, error: "Estado inválido" };

    try {
        await prisma.$transaction(async (tx) => {
            const schedule = await tx.schedule.findUnique({ where: { id: scheduleId } });
            if (!schedule) throw new Error("Turno no encontrado");

            await tx.schedule.update({
                where: { id: scheduleId },
                data: { status: parsedStatus.data, updated_at: new Date() },
            });

            if (parsedStatus.data === "completado" && schedule.expires_in === null) {
                await tx.payment.update({
                    where: { schedule_id: schedule.id },
                    data: { status: "aprobado", updated_at: new Date() },
                });
            }
        });

        return { success: true, data: undefined };
    } catch (error) {
        if (error instanceof Error && error.message === "Turno no encontrado") {
            return { success: false, error: error.message };
        }
        return actionError(error);
    }
}

export async function createService(input: unknown): Promise<ActionResult<{ id: string }>> {
    await requireAdmin();
    const parsed = serviceSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error: "Datos inválidos",
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    try {
        const service = await prisma.service.create({ data: parsed.data });
        return { success: true, data: { id: service.id } };
    } catch (error) {
        return actionError(error);
    }
}

export async function updateService(serviceId: string, price: unknown): Promise<ActionResult> {
    await requireAdmin();
    const parsedId = z.uuid().safeParse(serviceId);
    const parsedPrice = priceSchema.safeParse(price);
    if (!parsedId.success) return { success: false, error: "Servicio no encontrado" };
    if (!parsedPrice.success) return { success: false, error: "Precio debe ser mayor a 0" };

    try {
        await prisma.service.update({ where: { id: serviceId }, data: { price: parsedPrice.data } });
        return { success: true, data: undefined };
    } catch (error) {
        return actionError(error);
    }
}

export async function deleteService(serviceId: string): Promise<ActionResult> {
    await requireAdmin();
    const parsedId = z.uuid().safeParse(serviceId);
    if (!parsedId.success) return { success: false, error: "Servicio no encontrado" };

    try {
        await prisma.service.delete({ where: { id: serviceId } });
        return { success: true, data: undefined };
    } catch (error) {
        return actionError(error);
    }
}

export async function login(input: unknown): Promise<ActionResult> {
    const parsed = userLoginSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error: "Datos de acceso inválidos",
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);
        const { error } = await supabase.auth.signInWithPassword(parsed.data);

        if (error) return { success: false, error: "Email o contraseña incorrectos" };
        return { success: true, data: undefined };
    } catch (error) {
        return actionError(error);
    }
}
