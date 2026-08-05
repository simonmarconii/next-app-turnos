"use client";

import { useService } from "@/app/_context/service-provider";
import Button from "./button";
import { FormEvent, useState } from "react";
import { ServiceType } from "@/types/service";

export default function ServicesList() {
    const [editingService, setEditingService] = useState<ServiceType | null>(null);
    const [deletingService, setDeletingService] = useState<ServiceType | null>(null);
    const [editForm, setEditForm] = useState({ price: 0 });

    const { services, deleteService, updateService, loading } = useService();

    async function handleDeleteService(serviceId: string) {
        await deleteService(serviceId);
        setDeletingService(null);
    }
    
    async function handleUpdateService(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!editingService) return;
        await updateService(editingService, editForm.price);
        setEditingService(null);
    }

    return (
        <div>
            {
                loading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-2xl border border-[#e4d6c8] bg-white px-4 py-3 shadow-sm animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-3/4" />
                                <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
                                <div className="flex justify-end gap-4 mt-4">
                                    <div className="h-10 bg-gray-200 rounded w-20" />
                                    <div className="h-10 bg-gray-200 rounded w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {
                                services.length > 0 && services.map((service) => (
                                    <div key={service.id} className="flex flex-col gap-4 rounded-2xl border border-[#d8cabd] bg-white p-4 shadow-sm">
                                        <div>
                                            <p className="text-base font-semibold text-[#1f1a16]">{service.name}</p>
                                            <p className="mt-1 text-sm text-[#4d4037]">${service.price}</p>
                                        </div>
                                        <div className="flex justify-end gap-4">
                                            <Button onClick={() => {
                                                    setEditingService(service);
                                                    setEditForm({ price: service.price });
                                                }} size="medium">
                                                Editar
                                            </Button>
                                            <Button onClick={() => setDeletingService(service)} variant="destructive" size="medium">
                                                Eliminar
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>

                        {editingService && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a16]/60 px-4 py-6">
                                <div className="w-full max-w-md rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb] p-6 shadow-[0_20px_50px_rgba(31,26,22,0.18)]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
                                                Editar servicio
                                            </p>
                                            <h2 className="mt-2 text-xl font-semibold text-[#1f1a16]">
                                                {editingService.name}
                                            </h2>
                                        </div>
                                    </div>

                                    <form className="mt-6 space-y-5" onSubmit={handleUpdateService}>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-[#4d4037]">Precio</label>
                                            <input
                                                type="number"
                                                value={editForm.price}
                                                onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                                                className="rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2">
                                            <Button onClick={() => setEditingService(null)} variant="outline" size="medium">
                                                Cancelar
                                            </Button>
                                            <Button type="submit" size="medium">
                                                Guardar cambios
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {deletingService && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a16]/60 px-4 py-6">
                                <div className="w-full max-w-md rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb] p-6 shadow-[0_20px_50px_rgba(31,26,22,0.18)]">
                                    <div className="flex flex-col gap-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
                                                    Eliminar servicio
                                                </p>
                                                <h2 className="mt-2 text-xl font-semibold text-[#1f1a16]">
                                                    ¿Desea eliminar {deletingService.name}?
                                                </h2>
                                            </div>
                                        </div>
                                        <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
                                            <Button onClick={() => setDeletingService(null)} variant="outline" size="medium">
                                                Cancelar
                                            </Button>
                                            <Button onClick={() => handleDeleteService(deletingService.id)} variant="destructive" size="medium">
                                                Eliminar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )
            }
        </div>
    )
}