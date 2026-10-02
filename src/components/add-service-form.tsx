"use client";

import { FormEvent, useState } from "react";
import Button from "./button";
import { useRouter } from "next/navigation";
import { createService } from "@/lib/actions";

export default function AddServiceForm() {
    const [newService, setNewService] = useState<{ name: string; price: number | "" }>({ name: "", price: "" });
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [error, setError] = useState<{
        name?: string[] | null;
        price?: string[] | null;
    }>({
        name: null,
        price: null
    });

    const router = useRouter();

    async function handleAddService(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (loading) return;
        setLoading(true);
        setError({
            name: null,
            price: null
        });
        setFormError(null);

        try {
            const result = await createService(newService);

            if (!result.success) {
                const fieldErrors = result.fieldErrors;
                if (fieldErrors?.name) {
                    setError((prevError) => ({
                        ...prevError,
                        name: fieldErrors.name,
                    }));
                }
                if (fieldErrors?.price) {
                    setError((prevError) => ({
                        ...prevError,
                        price: fieldErrors.price,
                    }));
                }
                if (!fieldErrors?.name && !fieldErrors?.price) setFormError(result.error);
            } else {
                setNewService({ name: "", price: "" });
                router.refresh();
            }
        } catch (error) {
            console.error("Error al agregar el servicio:", error);
            setFormError("No se pudo agregar el servicio. Intentá nuevamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="border-b border-[#d8cabd] pb-6">
            <h3 className="text-lg font-semibold text-[#1f1a16]">
                Agregar un servicio
            </h3>
            <p className="mt-1 text-sm text-[#5c4f44]">
                Sumá un servicio para que esté disponible al reservar un turno.
            </p>
            <form className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_11rem_auto] md:items-end" onSubmit={handleAddService}>
                <div className="flex flex-col gap-2">
                    <label htmlFor="service-name" className="text-sm font-semibold text-[#4d4037]">Nombre</label>
                    <input 
                        id="service-name"
                        type="text" 
                        name="name"
                        value={newService.name}
                        onChange={(e) => setNewService((current) => ({ ...current, name: e.target.value }))}
                        aria-invalid={Boolean(error.name)}
                        aria-describedby={error.name ? "service-name-error" : undefined}
                        required
                        className="rounded-2xl border border-[#cdbfae] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15" 
                    />
                    {error.name && (
                        <div id="service-name-error" role="alert" className="text-sm text-[#b42318]">
                            {error.name.join(" ")}
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="service-price" className="text-sm font-semibold text-[#4d4037]">Precio</label>
                    <input 
                        id="service-price"
                        type="number" 
                        name="price"
                        value={newService.price}
                        min="0"
                        step="0.01"
                        onChange={(e) => {
                            setNewService((current) => ({
                                ...current,
                                price: e.target.value === "" ? "" : Number(e.target.value),
                            }));
                        }}
                        aria-invalid={Boolean(error.price)}
                        aria-describedby={error.price ? "service-price-error" : undefined}
                        required
                        className="rounded-2xl border border-[#cdbfae] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                    />
                    {error.price && (
                        <div id="service-price-error" role="alert" className="text-sm text-[#b42318]">
                            {error.price.join(" ")}
                        </div>
                    )}
                </div>
                <Button type="submit" size="medium" disabled={loading}>
                    {loading ? "Agregando..." : "Agregar"}
                </Button>
            </form>
            {formError && <p role="alert" className="mt-3 text-sm text-[#b42318]">{formError}</p>}
        </div>
    )
}
