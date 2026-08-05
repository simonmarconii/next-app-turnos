"use client";

import { useService } from "@/app/_context/service-provider";
import { FormEvent, useState } from "react";
import Button from "./button";

export default function AddServiceForm() {
    const [newService, setNewService] = useState({ name: "", price: 0 });

    const { addService, error } = useService();

    async function handleAddService(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!newService) return;
        await addService(newService);
    }

    return (
        <div className={`flex flex-col gap-4 rounded-[2rem] border ${ error ? "border-[#b56b49]" : "border-[#d8cabd]"} bg-[#f8f3eb] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.05)] sm:p-8`}>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
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
                {error && <p className="text-sm text-[#b56b49]">{error}</p>}
            </form>
        </div>
    )
}