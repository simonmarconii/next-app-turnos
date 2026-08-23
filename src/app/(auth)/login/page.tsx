"use client";

import Button from "@/components/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

type FormData = {
    email: string;
    password: string;
};

const initialFormData: FormData = {
    email: "",
    password: "",
};

export default function LoginPage() {
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    function updateField(field: keyof FormData, value: string) {
        setFormData((current) => ({ ...current, [field]: value }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!formData.email || !formData.password) {
            setError("Por favor, complete todos los campos");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const data = await response.json();
                setError(data.error);
            } else {
                router.push("/admin");
                router.refresh();
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setError("Error al enviar el formulario");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-32">
            <div className={`overflow-hidden rounded-[2rem] border border-[#cdbfae] bg-white/80 shadow-[0_24px_80px_rgba(44,30,18,0.12)] backdrop-blur`}>
                <div className="border-b border-[#e6d7c8] bg-gradient-to-r from-[#f4e7da] to-[#eef3ec] px-6 py-5 sm:px-8">
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7a5a46]">
                        Iniciar sesión
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f1a16] sm:text-4xl">
                        Mis turnos
                    </h1>
                </div>
                <form className="space-y-8" onSubmit={handleSubmit}>
                    <section className="flex flex-col gap-6 px-6 py-8 sm:px-8">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="email" className="text-sm font-medium text-[#4d4037]">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(event) => updateField("email", event.target.value)}
                                    className={`rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15`}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="password" className="text-sm font-medium text-[#4d4037]">
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(event) => updateField("password", event.target.value)}
                                    className={`rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15`}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button disabled={loading} type="submit" size="medium">
                                Iniciar sesión
                            </Button>
                        </div>
                        {error && (
                            <div className="text-lg text-red-600">
                                {error}
                            </div>
                        )}
                    </section>
                </form>
            </div>
        </main>
    );
}