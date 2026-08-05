"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ServiceType } from "@/types/service";

type ServiceContextType = {
    services: ServiceType[];
    loading: boolean;
    error: string | null;
    addService: (newService: { name: string; price: number }) => Promise<void>;
    deleteService: (serviceId: string) => Promise<void>;
    updateService: (editingService: ServiceType, price: number) => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType>({
    services: [],
    loading: true,
    error: null,
    addService: async () => {},
    deleteService: async () => {},
    updateService: async () => {},
});

export function ServiceProvider({ children }: { children: React.ReactNode }) {
    const [services, setServices] = useState<ServiceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch("/api/service", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    console.error("Error fetching services:", response.statusText);
                    setError("Error al obtener los servicios");
                    return;
                }

                const servicesData = await response.json();

                setServices(servicesData);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Error al obtener los servicios");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    async function addService(newService: { name: string; price: number }) {
        setLoading(true);
        setError(null);

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
                setError("Error al agregar el servicio");
                return;
            }

            const data = await response.json();
            setServices((prevServices) => [...prevServices, data]);
        } catch (error) {
            console.error("Error adding service:", error);
            setError("Error al agregar el servicio");
        } finally {
            setLoading(false);
        }
    }

    async function deleteService(serviceId: string) {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/service/${serviceId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                console.error("Error deleting service:", response.statusText);
                setError("Error al eliminar el servicio");
                return;
            }

            setServices((prevServices) => prevServices.filter(service => service.id !== serviceId));
        } catch (error) {
            console.error("Error deleting service:", error);
            setError("Error al eliminar el servicio");
        } finally {
            setLoading(false);
        }
    }

    async function updateService(editingService: ServiceType, price: number) {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/service/${editingService.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    price
                }),
            });

            if (!response.ok) {
                console.error("Error updating service:", response.statusText);
                setError("Error al actualizar el servicio");
                return;
            }

            setServices((prevServices) => prevServices.map((service) =>
                service.id === editingService.id
                    ? { ...service, price }
                    : service
            ));
        } catch (error) {
            console.error("Error updating service:", error);
            setError("Error al actualizar el servicio");
        } finally {
            setLoading(false);
        }
    }

    return (
        <ServiceContext.Provider value={{ services, loading, addService, deleteService, updateService, error }}>
            {children}
        </ServiceContext.Provider>
    );
}

export function useService() {
    const context = useContext(ServiceContext);
    if (context === undefined) {
        throw new Error("useService must be used within a ServiceProvider");
    }
    return context;
}