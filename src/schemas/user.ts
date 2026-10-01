import {z} from "zod";

export const userLoginSchema = z.object({
    email: z.string().email({ message: "El correo electrónico no es válido" }),
    password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
})

export const userScheduleSchema = z.object({
    name: z.string().trim().min(1, { message: "El nombre es obligatorio" }),
    lastname: z.string().trim().min(1, { message: "El apellido es obligatorio" }),
    email: z.string().email({ message: "El correo electrónico no es válido" }),
    phone: z.string().trim().min(1, { message: "El teléfono es obligatorio" }),
})