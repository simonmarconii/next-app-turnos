import { z } from "zod";

export const dateSchema = z.object({
    date: z.string().min(1, { message: "La fecha es obligatoria" }),
    time: z.string().min(1, { message: "La hora es obligatoria" }),
});