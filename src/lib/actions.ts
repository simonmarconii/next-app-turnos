"use server";

import { cookies } from "next/headers";
import { Preference } from "mercadopago";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import mercadoPagoClient from "@/lib/mercadopago";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { dateSchema, scheduleSchema } from "@/schemas/schedule";
import { priceSchema, serviceSchema } from "@/schemas/service";
import { userLoginSchema } from "@/schemas/user";

type ActionResult<T = undefined> =
    | { success: true; data: T }
    | { success: false; error: string; fieldErrors?: Record<string, string[]> };

const preferenceClient = new Preference(mercadoPagoClient);

async function requireAuthenticatedUser() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("No autorizado");
    }

    return user;
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

    try {
        let user = await prisma.user.findFirst({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: { name, lastname, email, phone },
            });
        }

        const expiresIn = paymentMethod === "transferencia" ? new Date() : null;
        if (expiresIn) expiresIn.setMinutes(expiresIn.getMinutes() + 10);

        const newSchedule = await prisma.schedule.create({
            data: {
                date: realDate,
                user_id: user.id,
                expires_in: expiresIn,
                service_id: serviceId,
            },
            include: { service: true },
        });

        if (paymentMethod !== "transferencia") {
            await prisma.payment.create({
                data: {
                    schedule_id: newSchedule.id,
                    amount: newSchedule.service.price,
                    payment_method: "in_person",
                },
            });

            await prisma.schedule.update({
                where: { id: newSchedule.id },
                data: { status: "confirmado", updated_at: new Date() },
            });
        }

        // El envío forma parte del flujo de reserva, pero su implementación
        // está aislada para poder reutilizarla desde otras features.
        if (paymentMethod !== "transferencia") {
            try {
                await sendEmail(newSchedule.id);
            } catch (error) {
                // El turno ya fue creado; un fallo del proveedor de email no
                // debe convertir una reserva válida en una reserva fallida.
                console.error("Error al enviar el email de confirmación:", error);
            }
        }

        return { success: true, data: { id: newSchedule.id } };
    } catch (error) {
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
        return actionError(error);
    }
}

export async function updateScheduleDate(
    scheduleId: string,
    input: unknown,
): Promise<ActionResult> {
    await requireAuthenticatedUser();
    const parsedDate = z.uuid().safeParse(scheduleId);
    const parsed = dateSchema.safeParse(input);

    if (!parsedDate.success) return { success: false, error: "Turno no encontrado" };
    if (!parsed.success) {
        return {
            success: false,
            error: "Fecha inválida",
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    const realDate = new Date(`${parsed.data.date}T${parsed.data.time}:00.000Z`);
    if (Number.isNaN(realDate.getTime())) return { success: false, error: "Fecha inválida" };

    try {
        await prisma.$transaction(async (tx) => {
            const schedule = await tx.schedule.findUnique({ where: { id: scheduleId } });
            if (!schedule) throw new Error("Turno no encontrado");

            await tx.schedule.update({
                where: { id: scheduleId },
                data: { date: realDate, updated_at: new Date() },
            });
        });

        return { success: true, data: undefined };
    } catch (error) {
        if (error instanceof Error && error.message === "Turno no encontrado") {
            return { success: false, error: error.message };
        }
        return actionError(error);
    }
}

export async function updateScheduleStatus(
    scheduleId: string,
    status: "confirmado" | "completado" | "cancelado",
): Promise<ActionResult> {
    await requireAuthenticatedUser();
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
    await requireAuthenticatedUser();
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
    await requireAuthenticatedUser();
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
    await requireAuthenticatedUser();
    const parsedId = z.uuid().safeParse(serviceId);
    if (!parsedId.success) return { success: false, error: "Servicio no encontrado" };

    try {
        await prisma.service.delete({ where: { id: serviceId } });
        return { success: true, data: undefined };
    } catch (error) {
        return actionError(error);
    }
}

// Sin uso actualmente pero se deja para poder reutilizarlo desde el panel admin en el futuro.
export async function sendScheduleEmail(scheduleId: string): Promise<ActionResult> {
    await requireAuthenticatedUser();
    const parsedId = z.uuid().safeParse(scheduleId);
    if (!parsedId.success) return { success: false, error: "Turno no encontrado" };

    try {
        await sendEmail(scheduleId);
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

