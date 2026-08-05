"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DateType } from "@/types/date";

type DateContextType = {
    dates: DateType[];
    loading: boolean;
}

const DateContext = createContext<DateContextType>({
    dates: [],
    loading: true,
});

export function DateProvider({ children }: { children: React.ReactNode }) {
    const [dates, setDates] = useState<DateType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch("/api/schedule", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    console.error("Error fetching services:", response.statusText);
                    return;
                }

                const servicesData = await response.json();

                setDates(servicesData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return (
        <DateContext.Provider value={{ dates, loading }}>
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