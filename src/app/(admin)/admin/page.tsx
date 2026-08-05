"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/app/_context/auth-provider";
import Button from "@/components/button";
import DatesList from "@/components/dates-list";
import ServiceList from "@/components/service-list";
import AddServiceForm from "@/components/add-service-form";

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

    const { user } = useAuth();

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
            <div className="rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.06)] sm:p-8">
                <h1 className="text-3xl font-semibold text-[#1f1a16] sm:text-4xl">
                    Bienvenido, {user?.email}
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#4d4037]">
                    Gestiona los turnos y servicios de tu negocio desde este panel de administración.
                </p>
            </div>

            <div className="flex flex-col gap-4 rounded-[2rem] border border-[#d8cabd] bg-[#fdfaf5] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.04)]">
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
                <DatesList />
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 rounded-[2rem] border border-[#d8cabd] bg-[#fdfaf5] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.04)]">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
                        Servicios disponibles
                    </p>
                    <ServiceList />
                </div>
                <div className=" flex flex-col gap-4 rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb] p-6 shadow-[0_10px_30px_rgba(31,26,22,0.05)] sm:p-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
                        Agregar nuevo servicio
                    </p>
                    <AddServiceForm />
                </div>
            </div>
        </div>
    )
}