"use client";

import { useService } from "@/app/_context/service-provider";
import { FormEvent, useState } from "react";
import Button from "./button";

export default function AddServiceForm() {
    const [newService, setNewService] = useState({ name: "", price: 0 });

    const { addService } = useService();

    async function handleAddService(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!newService) return;
        await addService(newService);
    }

    return (
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
    )
}