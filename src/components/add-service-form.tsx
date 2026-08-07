"use client";

import { FormEvent, useState } from "react";
import Button from "./button";
import { useRouter } from "next/navigation";

export default function AddServiceForm() {
    const [newService, setNewService] = useState({ name: "", price: 0 });

    const router = useRouter();

    async function handleAddService(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!newService) return;

        try {
            const response = await fetch("/api/service", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newService),
            });

            if (!response.ok) {
                throw new Error("Error al agregar el servicio");
            }

            router.refresh();
        } catch (error) {
            throw new Error("Error al agregar el servicio" + error);
        }
    }

    return (
        <div className={`flex flex-col gap-4 rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.05)] sm:p-8`}>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82] border-b border-[#d8cabd] pb-2">
                Agregar nuevo servicio
            </p>
            <form className="space-y-6" onSubmit={handleAddService}>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[#4d4037]">Nombre</label>
                    <input 
                        type="text" 
                        name="name"
                        value={newService!.name}
                        onChange={(e) => setNewService({ ...newService!, name: e.target.value })}
                        className="rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15" 
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[#4d4037]">Precio</label>
                    <input 
                        type="number" 
                        name="price"
                        value={newService!.price}
                        onChange={(e) => {
                            setNewService({ ...newService!, price: parseFloat(e.target.value) })}
                        }
                        className="rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                    />
                </div>
                <div className="pt-2">
                    <Button type="submit" size="medium">
                        Agregar
                    </Button>
                </div>
            </form>
        </div>
    )
}