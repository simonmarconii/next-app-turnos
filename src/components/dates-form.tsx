"use client";

import { DateType } from '@/types/date';
import { ServiceType } from '@/types/service';
import React, { useMemo, useState } from 'react'
import Button from './button';
import { MdOutlinePayment } from "react-icons/md";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { MdStorefront } from "react-icons/md";

type FormData = {
    paymentMethod: string;
    serviceId: string;
    date: string;
    time: string;
    name: string;
    lastname: string;
    email: string;
    phone: string;
};

const initialFormData: FormData = {
    paymentMethod: "",
    serviceId: "",
    date: "",
    time: "",
    name: "",
    lastname: "",
    email: "",
    phone: "",
};

const timeSlots = [
    "09:00",
    "11:00",
    "13:00",
    "15:00",
    "17:00",
];

function splitDateTime(raw: string) {
    const normalized = raw.replace("T", " ");
    const [datePart, timePart = ""] = normalized.split(" ");
    const time = timePart.slice(0, 5);
    return { datePart, time };
}

type Props = {
    services: ServiceType[];
    dates: DateType[];
}

function DatesForm({ services, dates }: Props) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [dateError, setDateError] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedService = useMemo(() => {
        return services.find((service) => service.id === formData.serviceId);
    }, [formData.serviceId, services]);

    const bookedTimesForSelectedDate = useMemo(() => {
        if (!formData.date) return [];
        return dates
            .map((d) => splitDateTime(d.date))
            .filter((d) => d.datePart === formData.date)
            .map((d) => d.time);
    }, [dates, formData.date]);

    const availableTimeSlots = useMemo(() => {
        return timeSlots.filter((slot) => !bookedTimesForSelectedDate.includes(slot));
    }, [bookedTimesForSelectedDate]);

    const isDayFull = formData.date !== "" && availableTimeSlots.length === 0;

    function updateField(field: keyof FormData, value: string) {
        setFormData((current) => ({ ...current, [field]: value }));
    }

    function handleServiceChange(value: string) {
        setDateError("");
        setFormData((current) => ({
            ...current,
            serviceId: value,
            date: "",
            time: "",
        }));
        setStep(1);
    }

    function handleDateChange(value: string) {
        setDateError("");
        const bookedForThatDay = dates
            .map((d) => splitDateTime(d.date))
            .filter((d) => d.datePart === value)
            .map((d) => d.time);
        const stillAvailable = timeSlots.filter((slot) => !bookedForThatDay.includes(slot));

        if (value && stillAvailable.length === 0) {
            setDateError("No quedan turnos disponibles para ese día. Elegí otra fecha.");
            setFormData((current) => ({ ...current, date: value, time: "" }));
            return;
        }

        setFormData((current) => ({ ...current, date: value, time: "" }));
    }

    function handleFirstStepNext() {
        if (!formData.serviceId) {
            return;
        }
        setStep(2);
    }

    function handleSecondStepNext() {
        if (!formData.date || !formData.time) {
            return;
        }
        if (isDayFull) {
            return;
        }
        setStep(3);
    }

    function handleThirdStepNext() {
        if (!formData.name || !formData.lastname || !formData.email || !formData.phone) {
            return;
        }
        setStep(4);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (!formData.paymentMethod) {
            return;
        }

        setLoading(true);

        try {
            const scheduleResponse = await fetch("/api/schedule", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!scheduleResponse.ok) {
                const data = await scheduleResponse.json();
                setError(data.message || "Error al solicitar el turno");
                throw new Error(data.message || "Error al solicitar el turno");
            } else {
                const emailResponse = await fetch("/api/send", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        lastname: formData.lastname,
                        email: formData.email,
                        date: formData.date,
                        time: formData.time,
                        serviceName: selectedService?.name,
                    }),
                });
    
                if (!emailResponse.ok) {
                    const data = await emailResponse.json();
                    setError(data.message || "Error al enviar el correo de confirmación");
                    throw new Error(data.message || "Error al enviar el correo de confirmación");
                }
            }

        } catch (error) {
            setError("Error al solicitar el turno: " + error);
            throw new Error("Error al solicitar el turno: " + error);
        } finally {
            setLoading(false);
        }
    }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-32">
        <div className={`overflow-hidden rounded-[2rem] ${ error ? "border-2 border-red-600" : "border border-[#cdbfae]"} bg-white/80 shadow-[0_24px_80px_rgba(44,30,18,0.12)] backdrop-blur`}>
            <div className="border-b border-[#e6d7c8] bg-gradient-to-r from-[#f4e7da] to-[#eef3ec] px-6 py-5 sm:px-8">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7a5a46]">
                    Turnos
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f1a16] sm:text-4xl">
                    Reservá tu turno
                </h1>
            </div>

            <div className="px-6 py-8 sm:px-8">
                <div className="mb-8 flex items-center gap-3 text-sm font-medium text-[#6a5a4d]">
                    <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                            step === 1
                                ? "border-[#b56b49] bg-[#b56b49] text-white"
                                : "border-[#b56b49] bg-white text-[#b56b49]"
                        }`}
                    >
                        1
                    </div>
                    <span className={step === 1 ? "text-[#1f1a16]" : ""}>Elegir servicio</span>
                    <div className="h-px flex-1 bg-[#e3d6ca]" />
                    <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                            step === 2
                                ? "border-[#b56b49] bg-[#b56b49] text-white"
                                : "border-[#d9c8b8] bg-white text-[#907968]"
                        }`}
                    >
                        2
                    </div>
                    <span className={step === 2 ? "text-[#1f1a16]" : "text-[#907968]"}>
                        Elegir turno
                    </span>
                    <div className="h-px flex-1 bg-[#e3d6ca]" />
                    <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                            step === 3
                                ? "border-[#b56b49] bg-[#b56b49] text-white"
                                : "border-[#d9c8b8] bg-white text-[#907968]"
                        }`}
                    >
                        3
                    </div>
                    <span className={step === 3 ? "text-[#1f1a16]" : "text-[#907968]"}>
                        Tus datos
                    </span>
                </div>

                {isSubmitted ? (
                    <section className="rounded-2xl border border-[#cfe0d5] bg-[#f3faf5] p-6 text-[#234034]">
                        <h2 className="text-2xl font-semibold">Tu turno fue solicitado</h2>
                        <p className="mt-3 leading-7">
                            {formData.name} {formData.lastname}, te esperamos el {formData.date} a las {formData.time}!.
                        </p>
                        <p className="mt-3 text-sm text-[#4f695a]">
                            Teléfono: {formData.phone}
                        </p>
                    </section>
                ) : (
                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {step === 1 ? (
                            <section className="grid gap-6">
                                <div className="grid gap-2">
                                    <label htmlFor="serviceId" className="text-sm font-medium text-[#4d4037]">
                                        Servicio
                                    </label>
                                    <select
                                        id="serviceId"
                                        name="serviceId"
                                        value={formData.serviceId}
                                        onChange={(event) => handleServiceChange(event.target.value)}
                                        className="rounded-2xl border border-[#d8cabd] bg-white appearance-none px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                                    >
                                        <option value="">Elegí un servicio</option>
                                        {services.map((service) => (
                                            <option key={service.id} value={service.id}>
                                                {service.name} - ${service.price}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end">
                                    <Button 
                                        onClick={handleFirstStepNext}
                                        disabled={!formData.serviceId}
                                        variant="primary"
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </section>
                        ) : step === 2 ? (
                            <section className="grid gap-6">
                                <div className="grid gap-2">
                                    <label htmlFor="date" className="text-sm font-medium text-[#4d4037]">
                                        Fecha
                                    </label>
                                    <input
                                        id="date"
                                        name="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(event) => handleDateChange(event.target.value)}
                                        className="rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                                    />
                                    {dateError && (
                                        <p className="text-sm font-medium text-[#b3412c]">
                                            {dateError}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <label htmlFor="time" className="text-sm font-medium text-[#4d4037]">
                                        Horario
                                    </label>
                                    <select
                                        id="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={(event) => updateField("time", event.target.value)}
                                        disabled={!formData.date || isDayFull}
                                        className="rounded-2xl border border-[#d8cabd] bg-white appearance-none px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                                    >
                                        <option value="">Elegí un horario</option>
                                        {timeSlots.map((timeSlot) => {
                                            const isBooked = bookedTimesForSelectedDate.includes(timeSlot);
                                            return (
                                                <option
                                                    key={timeSlot}
                                                    value={timeSlot}
                                                    disabled={isBooked}
                                                >
                                                    {timeSlot} {isBooked ? "(no disponible)" : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                                    <Button onClick={() => setStep(1)} variant="outline">
                                        Volver
                                    </Button>
                                    <Button
                                        onClick={handleSecondStepNext}
                                        disabled={!formData.date || !formData.time || isDayFull}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </section>
                        ) : step === 3 ? (
                            <section className="grid gap-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <label htmlFor="name" className="text-sm font-medium text-[#4d4037]">
                                            Nombre
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(event) => updateField("name", event.target.value)}
                                            className="rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <label htmlFor="lastName" className="text-sm font-medium text-[#4d4037]">
                                            Apellido
                                        </label>
                                        <input
                                            id="lastName"
                                            name="lastname"
                                            type="text"
                                            value={formData.lastname}
                                            onChange={(event) => updateField("lastname", event.target.value)}
                                            className="rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <label htmlFor="email" className="text-sm font-medium text-[#4d4037]">
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(event) => updateField("email", event.target.value)}
                                            className="rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <label htmlFor="phone" className="text-sm font-medium text-[#4d4037]">
                                            Teléfono
                                        </label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(event) => updateField("phone", event.target.value)}
                                            className="rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                                    <Button onClick={() => setStep(2)} variant="outline">
                                        Volver
                                    </Button>
                                    <Button
                                        onClick={handleThirdStepNext}
                                        disabled={!formData.date || !formData.time || isDayFull}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </section>
                        ) : (
                            <section className="grid gap-6">
                                <div className="grid gap-2">
                                    <h2 className="text-2xl font-semibold">Resumen</h2>
                                    <div className="grid gap-2 lg:grid-cols-2">
                                        <div>
                                            <p className="text-[#907968]">
                                                Cliente
                                            </p>
                                            <p className="font-medium">
                                                {formData.name} {formData.lastname}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[#907968]">
                                                Servicio
                                            </p>
                                            <p className="font-medium">
                                                { selectedService?.name }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[#907968]">
                                                Fecha y hora
                                            </p>
                                            <p className="font-medium">
                                                {formData.date}, {formData.time}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[#907968]">
                                                Valor
                                            </p>
                                            <p className="font-medium">
                                                ${ selectedService?.price }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <div>
                                        <h2 className="text-2xl font-semibold">Elegir método de pago</h2>
                                    </div>
                                    <div className="flex flex-col gap-2 lg:gap-4 sm:justify-start sm:flex-row sm:items-center">
                                        <Button variant={`${formData.paymentMethod === "efectivo" ? "primary" : "outline"}`} onClick={() => updateField("paymentMethod", "efectivo")}>
                                            <div className="flex justify-between gap-2 items-center">
                                                <div className="flex gap-2 items-center">
                                                    <MdOutlinePayment className="text-xl" />
                                                    <p>Pago en el lugar</p>
                                                </div>
                                                {formData.paymentMethod === "efectivo" && <IoIosCheckmarkCircle className="text-xl" />}
                                            </div>
                                        </Button>
                                        <Button variant={`${formData.paymentMethod === "transferencia" ? "primary" : "outline"}`} onClick={() => updateField("paymentMethod", "transferencia")}>
                                            <div className="flex justify-between gap-2 items-center">
                                                <div className="flex gap-2 items-center">
                                                    <MdStorefront className="text-xl" />
                                                    <p>Mercado Pago</p>
                                                </div>
                                                {formData.paymentMethod === "transferencia" && <IoIosCheckmarkCircle className="text-xl" />}
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between"> 
                                    <Button onClick={() => setStep(3)} variant="outline">
                                        Volver
                                    </Button>
                                    <Button type="submit" variant="primary" disabled={loading}>
                                        {loading ? "Solicitando turno..." : "Solicitar turno"}
                                    </Button>
                                </div>
                            </section>
                        )}
                    </form>
                )}
            </div>
        </div>
    </main>
  )
}

export default DatesForm