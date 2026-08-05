"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DateType } from "@/types/date";

type DateContextType = {
    dates: DateType[];
    loading: boolean;
    error: string | null;
    addDate: (formData: { name: string; lastname: string; email: string; phone: string; serviceId: string; date: string }) => Promise<void>;
}

const DateContext = createContext<DateContextType>({
    dates: [],
    loading: true,
    error: null,
    addDate: async () => {}
});

export function DateProvider({ children }: { children: React.ReactNode }) {
    const [dates, setDates] = useState<DateType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch("/api/schedule", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    console.error("Error fetching services:", response.statusText);
                    setError("Error al obtener los turnos");
                    return;
                }

                const servicesData = await response.json();

                setDates(servicesData);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Error al obtener los turnos");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    async function addDate(formData: { name: string; lastname: string; email: string; phone: string; serviceId: string; date: string }) {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/schedule", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                console.error("Error submitting form:", response.statusText);
                setError("Error al agregar el turno");
                return;
            }
        } catch (error) {
            console.error("Error adding date:", error);
            setError("Error al agregar el turno");
        } finally {
            setLoading(false);
        }
    }

    return (
        <DateContext.Provider value={{ dates, loading, error, addDate }}>
            {children}
        </DateContext.Provider>
    );
}

export function useDate() {
    const context = useContext(DateContext);
    if (context === undefined) {
        throw new Error("useDate must be used within a DateProvider");
    }
    return context;
}