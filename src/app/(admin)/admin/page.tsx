"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/app/_context/auth-provider";

type ServiceType = {
    id: string;
    name: string;
    price: number;
    created_at: string;
}

type UserType = {
    id: string;
    name: string;
    lastname: string;
    email: string;
    phone: string;
    created_at: string;
}

type DateType = {
    id: string;
    user_id: string;
    user: UserType;
    service_id: string;
    service: ServiceType;
    date: string;
    created_at: string;
}

export default function AdminPage() {
    const [services, setServices] = useState<ServiceType[]>([]);
    const [dates, setDates] = useState<DateType[]>([]);
    const [newService, setNewService] = useState({ name: "", price: 0 });
    const [editingService, setEditingService] = useState<ServiceType | null>(null);
    const [deletingService, setDeletingService] = useState<ServiceType | null>(null);
    const [editForm, setEditForm] = useState({ price: 0 });
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [scheduleResponse, servicesResponse] = await Promise.all([
                    fetch("/api/schedule", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }),
                    fetch("/api/service", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }),
                ]);

                if (!scheduleResponse.ok) {
                    console.error("Error fetching schedules:", scheduleResponse.statusText);
                    return;
                }

                if (!servicesResponse.ok) {
                    console.error("Error fetching services:", servicesResponse.statusText);
                    return;
                }

                const [scheduleData, servicesData] = await Promise.all([
                    scheduleResponse.json(),
                    servicesResponse.json(),
                ]);

                setDates(scheduleData);
                setServices(servicesData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    async function handleAddService(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/service", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newService.name,
                    price: newService.price,
                }),
            });

            if (!response.ok) {
                console.error("Error adding service:", response.statusText);
                return;
            }

            const data = await response.json();
            setServices((prevServices) => [...prevServices, data]);
            setNewService({ name: "", price: 0 });
        } catch (error) {
            console.error("Error adding service:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteService(serviceId: string) {
        setLoading(true);

        try {
            const response = await fetch(`/api/service/${serviceId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                console.error("Error deleting service:", response.statusText);
                return;
            }

            setServices((prevServices) => prevServices.filter(service => service.id !== serviceId));
            setDeletingService(null);
        } catch (error) {
            console.error("Error deleting service:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateService(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!editingService) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/service/${editingService.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    price: editForm.price,
                }),
            });

            if (!response.ok) {
                console.error("Error updating service:", response.statusText);
                return;
            }

            setServices((prevServices) => prevServices.map((service) =>
                service.id === editingService.id
                    ? { ...service, price: editForm.price }
                    : service
            ));
            setEditingService(null);
            setEditForm({ price: 0 });
        } catch (error) {
            console.error("Error updating service:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center">
                <p className="px-4 py-8 text-sm font-medium text-[#4d4037]">Loading...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.06)] sm:p-8">
                <h1 className="text-3xl font-semibold text-[#1f1a16] sm:text-4xl">
                    Bienvenido, {user?.email}
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#4d4037]">
                    Gestiona los turnos y servicios de tu negocio desde este panel de administración.
                </p>
            </div>

            <div className="rounded-[2rem] border border-[#d8cabd] bg-[#fdfaf5] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.04)]">
                <div className="flex flex-col items-center gap-1 md:flex-row md:gap-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
                        Turnos
                    </p>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
                        -
                    </p>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
                        Hoy: {new Date().toLocaleDateString("es-AR", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                </div>
                <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    {dates && (
                        dates.map((date) => (
                            <div
                                key={date.id}
                                className="rounded-2xl border border-[#e4d6c8] bg-white px-4 py-3 shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-[#1f1a16]">
                                        Dia:
                                    </p>
                                    <p className="text-sm font-medium text-[#1f1a16]">
                                        {new Date(date.date).toLocaleDateString("es-AR", { weekday: "long", month: "long", day: "numeric" })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-[#1f1a16]">
                                        Hora:
                                    </p>
                                    <p className="text-sm font-medium text-[#1f1a16]">
                                        {new Date(date.date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm text-[#1f1a16]">
                                        Cliente:
                                    </p>
                                    <p className="text-sm font-medium text-[#1f1a16]">
                                        {date.user.name} {date.user.lastname} - {date.user.email}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-[#1f1a16]">
                                        Servicio:
                                    </p>
                                    <p className="text-sm font-medium text-[#1f1a16]">
                                        {date.service.name} - ${date.service.price}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <div className="rounded-[2rem] border border-[#d8cabd] bg-[#fdfaf5] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.04)]">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
                        Servicios disponibles
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {
                            services.length > 0 && services.map((service) => (
                                <div key={service.id} className="flex flex-col gap-4 rounded-2xl border border-[#d8cabd] bg-white p-4 shadow-sm">
                                    <div>
                                        <p className="text-base font-semibold text-[#1f1a16]">{service.name}</p>
                                        <p className="mt-1 text-sm text-[#4d4037]">${service.price}</p>
                                    </div>
                                    <div className="flex justify-end gap-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingService(service);
                                                setEditForm({ price: service.price });
                                            }}
                                            className="rounded-[2rem] bg-[#b56b49] px-5 py-3 text-sm font-semibold text-[#fff8f1] transition hover:bg-[#a95f40]"
                                        >
                                            Editar
                                        </button>
                                        <button onClick={() => setDeletingService(service)} className="bg-red-500 text-[#fff8f1] px-5 py-3 font-semibold rounded-[2rem] transition hover:bg-red-600">
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                <div className="rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.05)] sm:p-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
                        Agregar nuevo servicio
                    </p>
                    <form className="mt-5 space-y-6" onSubmit={handleAddService}>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-[#4d4037]">Nombre</label>
                            <input 
                                type="text" 
                                name="name"
                                value={newService.name}
                                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                className="rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15" 
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-[#4d4037]">Precio</label>
                            <input 
                                type="number" 
                                name="price"
                                value={newService.price}
                                onChange={(e) => {
                                    setNewService({ ...newService, price: parseFloat(e.target.value) })}
                                }
                                className="rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                            />
                        </div>
                        <div className="pt-2">
                            <button type="submit" className="rounded-[2rem] bg-[#b56b49] px-5 py-3 text-sm font-semibold text-[#fff8f1] transition hover:bg-[#a95f40]">
                                Agregar
                            </button>
                        </div>
                    </form>
                </div>
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
                                <button
                                    type="button"
                                    onClick={() => setEditingService(null)}
                                    className="rounded-[2rem] border border-[#d8cabd] px-5 py-3 text-sm font-semibold text-[#4d4037] transition hover:bg-[#efe6d8]"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-[2rem] bg-[#b56b49] px-5 py-3 text-sm font-semibold text-[#fff8f1] transition hover:bg-[#a95f40]"
                                >
                                    Guardar cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {deletingService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a16]/60 px-4 py-6">
                    <div className="w-full max-w-md rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb] p-6 shadow-[0_20px_50px_rgba(31,26,22,0.18)]">
                        <div className="flex flex-col items-center gap-5 text-center">
                            <div>
                                <h2 className="mt-2 text-xl font-semibold text-[#1f1a16]">
                                    ¿Desea eliminar {deletingService.name}?
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-[#4d4037]">
                                    Esta acción no se puede deshacer y quitará el servicio de la lista.
                                </p>
                            </div>
                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                                <button
                                    type="button"
                                    onClick={() => setDeletingService(null)}
                                    className="rounded-[2rem] border border-[#d8cabd] px-5 py-3 text-sm font-semibold text-[#4d4037] transition hover:bg-[#efe6d8]"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleDeleteService(deletingService.id)}
                                    className="bg-red-500 text-[#fff8f1] px-5 py-3 font-semibold rounded-[2rem] transition hover:bg-red-600"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}