import { describe, expect, it } from 'vitest';
import { scheduleSchema } from "@/schemas/schedule";

const validSchedule = {
    name: "Maria",
    lastname: "Perez",
    email: "maria@example.com",
    phone: "2915555555",
    serviceId: "550e8400-e29b-41d4-a716-446655440000",
    date: "2024-06-15",
    time: "12:00",
    paymentMethod: "efectivo",
};

describe('scheduleSchema', () => {
    it('acepta una recerva valida', () => {
        const result = scheduleSchema.safeParse(validSchedule);
        expect(result.success).toBe(true);
    });

    it('rechaza una reserva con nombre vacio', () => {
        const result = scheduleSchema.safeParse({
            ...validSchedule,
            name: "",
        });
        expect(result.success).toBe(false);
    });

    it('rechaza una reserva con apellido vacio', () => {
        const result = scheduleSchema.safeParse({
            ...validSchedule,
            lastname: "",
        });
        expect(result.success).toBe(false);
    });

    it('rechaza una reserva con email invalido', () => {
        const result = scheduleSchema.safeParse({
            ...validSchedule,
            email: "invalid-email",
        });
        expect(result.success).toBe(false);
    });

    it('rechaza una reserva con email vacio', () => {
        const result = scheduleSchema.safeParse({
            ...validSchedule,
            email: "",
        });
        expect(result.success).toBe(false);
    });

    it('rechaza una reserva con telefono invalido', () => {
        const result = scheduleSchema.safeParse({
            ...validSchedule,
            phone: null,
        });
        expect(result.success).toBe(false);
    });

    it('rechaza una reserva con telefono vacio', () => {
        const result = scheduleSchema.safeParse({
            ...validSchedule,
            phone: "",
        });
        expect(result.success).toBe(false);
    });

    it('rechaza una reserva con fecha vacia', () => {
        const result = scheduleSchema.safeParse({
            ...validSchedule,
            date: "",
        });
        expect(result.success).toBe(false);
    });

    it('rechaza una reserva con hora vacia', () => {
        const result = scheduleSchema.safeParse({
            ...validSchedule,
            time: "",
        });
        expect(result.success).toBe(false);
    });
})
