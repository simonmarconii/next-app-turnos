import { z } from "zod";

export const priceSchema = z.number().positive({ message: "El precio debe ser un mayor a 0" });

export const serviceSchema = z.object({
    name: z.string().min(1, { message: "El nombre del servicio es obligatorio" }),
    price: priceSchema
})