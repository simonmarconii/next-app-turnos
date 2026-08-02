"use client";

import { useState } from "react";

type FormData = {
    date: string;
    time: string;
    name: string;
    lastname: string;
    email: string;
    phone: string;
};

const initialFormData: FormData = {
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

export default function SchedulesPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitted, setIsSubmitted] = useState(false);

    function updateField(field: keyof FormData, value: string) {
        setFormData((current) => ({ ...current, [field]: value }));
    }

    function handleFirstStepNext() {
        if (!formData.date || !formData.time) {
            return;
        }

        setStep(2);
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

    return (
        <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-29">
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
                        <span className={step === 1 ? "text-[#1f1a16]" : ""}>Elegir turno</span>
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
                            Tus datos
                        </span>
                    </div>

                    {isSubmitted ? (
                        <section className="rounded-2xl border border-[#cfe0d5] bg-[#f3faf5] p-6 text-[#234034]">
                            <h2 className="text-2xl font-semibold">Tu turno fue solicitado</h2>
                            <p className="mt-3 leading-7">
                                {formData.name} {formData.lastname}, te vamos a contactar a {formData.email} para confirmar el turno del {formData.date} a las {formData.time}.
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
                                        <label htmlFor="date" className="text-sm font-medium text-[#4d4037]">
                                            Fecha
                                        </label>
                                        <input
                                            id="date"
                                            name="date"
                                            type="date"
                                            value={formData.date}
                                            onChange={(event) => updateField("date", event.target.value)}
                                            className="rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                                        />
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
                                            disabled={!formData.date}
                                            className="rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                                        >
                                            <option value="">Elegí un horario</option>
                                            {timeSlots.map((timeSlot) => (
                                                <option key={timeSlot} value={timeSlot}>
                                                    {timeSlot}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleFirstStepNext}
                                            disabled={!formData.date || !formData.time}
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
                                            onClick={() => setStep(1)}
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