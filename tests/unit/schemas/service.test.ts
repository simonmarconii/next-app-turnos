import { describe, expect, it } from 'vitest';
import { serviceSchema } from "@/schemas/service";

describe('serviceSchema', () => {
    it('acepta un servicio valido', () => {
        const result = serviceSchema.safeParse({
            name: 'Servicio de prueba',
            price: 15000,
        })
        expect(result.success).toBe(true);
    });

    it('rechaza un servicio con precio igual a 0', () => {
        const result = serviceSchema.safeParse({
            name: 'Servicio de prueba',
            price: 0,
        })
        expect(result.success).toBe(false);
    })

    it('rechaza un servicio con nombre vacio', () => {
        const result = serviceSchema.safeParse({
            name: '',
            price: 15000,
        })
        expect(result.success).toBe(false);
    })
})