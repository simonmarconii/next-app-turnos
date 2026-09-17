import { z } from "zod";

export const dateSchema = z.object({
    date: z.string().min(1, { message: "La fecha es obligatoria" }),
    time: z.string().min(1, { message: "La hora es obligatoria" }),
});

export const scheduleSchema = z.object({
    name: z.string().min(1),
    lastname: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    serviceId: z.string().min(1),
    paymentMethod: z.enum(["transferencia"]).or(z.enum(["efectivo"]))
        .or(z.enum(["tarjeta"]))
        .or(z.enum(["otro"]))
        .catch("efectivo"),
}).and(dateSchema);