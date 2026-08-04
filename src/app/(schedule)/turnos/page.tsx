"use client";

import { useEffect, useMemo, useState } from "react";

type DateType = {
    id: string;
    date: string;
    service_id: string;
    user_id: string;
    created_at: string;
}

type ServiceType = {
    id: string;
    name: string;
    price: number;
    created_at: string;
}

type FormData = {
    serviceId: string;
    date: string;
    time: string;
    name: string;
    lastname: string;
    email: string;
    phone: string;
};

const initialFormData: FormData = {
    serviceId: "",
    date: "",
    time: "",
    name: "",
    lastname: "",
    email: "",
    phone: "",
};

const timeSlots = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
];

function splitDateTime(raw: string) {
    const normalized = raw.replace("T", " ");
    const [datePart, timePart = ""] = normalized.split(" ");
    const time = timePart.slice(0, 5); // "HH:MM"
    return { datePart, time };
}

export default function SchedulesPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [dates, setDates] = useState<DateType[]>([]);
    const [services, setServices] = useState<ServiceType[]>([]);
    const [dateError, setDateError] = useState("");

    const [loading, setLoading] = useState(true);

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

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!formData.name || !formData.lastname || !formData.email || !formData.phone) {
            return;
        }

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
                return;
            }

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
                console.error("Error sending email:", emailResponse.statusText);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitted(true);
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
        <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-32">
            <div className="overflow-hidden rounded-[2rem] border border-[#cdbfae] bg-white/80 shadow-[0_24px_80px_rgba(44,30,18,0.12)] backdrop-blur">
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
                                            className="rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                                        >
                                            <option value="">Elegí un servicio</option>
                                            {services.map((service) => (
                                                <option key={service.id} value={service.id}>
                                                    {service.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleFirstStepNext}
                                            disabled={!formData.serviceId}
                                            className="rounded-full bg-[#b56b49] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#9f5d3f] disabled:cursor-not-allowed disabled:bg-[#d7b09d]"
                                        >
                                            Siguiente
                                        </button>
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
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="rounded-full border border-[#d8cabd] px-6 py-3 text-sm font-semibold text-[#4d4037] transition hover:border-[#b56b49] hover:text-[#b56b49]"
                                        >
                                            Volver
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSecondStepNext}
                                            disabled={!formData.date || !formData.time || isDayFull}
                                            className="rounded-full bg-[#b56b49] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#9f5d3f] disabled:cursor-not-allowed disabled:bg-[#d7b09d]"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </section>
                            ) : (
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
                                        <button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            className="rounded-full border border-[#d8cabd] px-6 py-3 text-sm font-semibold text-[#4d4037] transition hover:border-[#b56b49] hover:text-[#b56b49]"
                                        >
                                            Volver
                                        </button>
                                        <button
                                            type="submit"
                                            className="rounded-full bg-[#234034] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173128]"
                                        >
                                            Confirmar turno
                                        </button>
                                    </div>
                                </section>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}