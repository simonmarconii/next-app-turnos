import { z } from "zod";
import { userScheduleSchema } from "./user";

export const dateSchema = z.object({
    date: z.string().trim().min(1, { message: "La fecha es obligatoria" }),
    time: z.string().trim().min(1, { message: "La hora es obligatoria" }),
});

export const scheduleSchema = userScheduleSchema
.extend({
    serviceId: z.string().trim().min(1),
    paymentMethod: z.enum([
        "transferencia",
        "efectivo",
    ])
}).and(dateSchema);