import { z } from "zod";

export const unavailablePeriodSchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inicial inválida"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha final inválida"),
    reason: z.string().trim().max(120, "El motivo no puede superar 120 caracteres").optional(),
});
