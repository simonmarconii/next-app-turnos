"use client";

import { DateType } from '@/types/date';
import { ServiceType } from '@/types/service';
import { useMemo, useState } from 'react'
import Button from './button';
import { MdOutlinePayment } from "react-icons/md";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { MdStorefront } from "react-icons/md";
import Select from './select';
import { useRouter } from "next/navigation";

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

const STEPS = ["Elegir servicio", "Elegir turno", "Tus datos", "Resumen"];

function splitDateTime(raw: string) {
    const normalized = raw.replace("T", " ");
    const [datePart, timePart = ""] = normalized.split(" ");
    const time = timePart.slice(0, 5);
    return { datePart, time };
}

type ErrorsType = {
    stepOne?: string;
    stepTwo?: string;
    stepThree?: string;
    stepFour?: string;
}

type Props = {
    services: ServiceType[];
    dates: DateType[];
}

function DatesForm({ services, dates }: Props) {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState(initialFormData);;
    const [errors, setErrors] = useState<ErrorsType>({});
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const router = useRouter();

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
        setFormData((current) => ({
            ...current,
            serviceId: value,
            date: "",
            time: "",
        }));
    }

    function handleDateChange(value: string) {
        const bookedForThatDay = dates
            .map((d) => splitDateTime(d.date))
            .filter((d) => d.datePart === value)
            .map((d) => d.time);
        const stillAvailable = timeSlots.filter((slot) => !bookedForThatDay.includes(slot));

        if (value && stillAvailable.length === 0) {
            setErrors((current) => ({ ...current, stepTwo: "No hay horarios disponibles para la fecha seleccionada." }));
            setFormData((current) => ({ ...current, date: value, time: "" }));
            return;
        }

        setFormData((current) => ({ ...current, date: value, time: "" }));
    }

    function validateStep() {
        const newErrors: ErrorsType = {};

        if (step === 0) {
            if (!formData.serviceId) newErrors.stepOne = "Por favor, seleccioná un servicio.";
        }

        if (step === 1) {
            if (!formData.date || !formData.time) newErrors.stepTwo = "Por favor, seleccioná una fecha y un horario.";
        }

        if (step === 2) {
            if (!formData.name || !formData.lastname || !formData.email || !formData.phone) newErrors.stepThree = "Por favor, completá todos los campos.";
        }

        if (step === 3) {
            if (!formData.paymentMethod) newErrors.stepFour = "Por favor, seleccioná un método de pago.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function next() {
        if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }

    function back() {
        setStep((s) => Math.max(s - 1, 0));
    }

    async function handleSubmit() {
        if (!validateStep()) {
            console.log("Errores de validación");
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
                throw new Error(data.message || "Error al solicitar el turno");
            }

            if (formData.paymentMethod === "transferencia") {
                const scheduleData = await scheduleResponse.json();
                const checkoutResponse = await fetch(`/api/schedule/${scheduleData.data.id}/checkout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
    
                if (!checkoutResponse.ok) {
                    const data = await scheduleResponse.json();
                    throw new Error(data.message || "Error al solicitar el turno");
                }
    
                const checkoutData = await checkoutResponse.json();
                router.push(checkoutData.data.init_point);
            } else {
                setIsSubmitted(true);
            }

        } catch (error) {
            throw new Error("Error al solicitar el turno: " + error);
        } finally {
            setLoading(false);
        }
    }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-32">
        <div className={`overflow-hidden rounded-[2rem] border border-[#cdbfae] bg-white/80 shadow-[0_24px_80px_rgba(44,30,18,0.12)] backdrop-blur`}>
            <div className="border-b border-[#e6d7c8] bg-gradient-to-r from-[#f4e7da] to-[#eef3ec] px-6 py-5 sm:px-8">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7a5a46]">
                    Turnos
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f1a16] sm:text-4xl">
                    Reservá tu turno
                </h1>
            </div>

            <div className="px-6 py-8 sm:px-8">
                {isSubmitted ? (
                    <div>
                        <p className="text-center text-lg font-medium text-[#1f1a16]">
                            {`¡Gracias por solicitar tu turno! Hemos recibido tu solicitud para el servicio "${selectedService?.name}" el día ${formData.date} a las ${formData.time}.`}
                        </p>
                        <p className="text-center text-sm text-[#4d4037]"> 
                            Te enviaremos mas informacion a tu correo electrónico: {formData.email}. Por favor, revisá en spam si no lo ves en tu bandeja de entrada.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex flex-col gap-4 flex-row sm:items-start">
                            {STEPS.map((label, index) => (
                                <div key={index} className="flex flex-1 flex-col items-center text-center">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${index <= step ? "bg-[#b56b49] text-white" : "bg-[#e6d7c8] text-[#4d4037]"}`}
                                    >
                                        {index + 1}
                                    </div>
                                    <span className={`mt-2 text-sm ${index === step ? "text-[#b56b49]" : "text-[#4d4037]"}`}>{label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-8">
                            {step === 0 ? (
                                <section className="grid gap-6">
                                    <div className="grid gap-2">
                                        <label htmlFor="serviceId" className="text-sm font-medium text-[#4d4037]">
                                            Servicio
                                        </label>
                                        <Select>
                                            <select
                                                id="serviceId"
                                                name="serviceId"
                                                value={formData.serviceId}
                                                onChange={(event) => handleServiceChange(event.target.value)}
                                                className="block w-full appearance-none bg-transparent pr-8 outline-none"
                                            >
                                                <option value="">Elegí un servicio</option>
                                                {services.map((service) => (
                                                    <option key={service.id} value={service.id}>
                                                        {service.name} - ${service.price}
                                                    </option>
                                                ))}
                                            </select>
                                        </Select>
                                        {errors.stepOne && <p className="text-md text-red-600">{errors.stepOne}</p>}
                                    </div>
                                </section>
                            ) : step === 1 ? (
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
                                    </div>

                                    <div className="grid gap-2">
                                        <label htmlFor="time" className="text-sm font-medium text-[#4d4037]">
                                            Horario
                                        </label>
                                        <Select>
                                            <select
                                                id="time"
                                                name="time"
                                                value={formData.time}
                                                onChange={(event) => updateField("time", event.target.value)}
                                                disabled={!formData.date || isDayFull}
                                                className="block w-full appearance-none bg-transparent pr-8 outline-none"
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
                                        </Select>
                                    </div>
                                    {errors.stepTwo && <p className="text-md text-red-600">{errors.stepTwo}</p>}
                                </section>
                            ) : step === 2 ? (
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
                                    {errors.stepThree && <p className="text-md text-red-600">{errors.stepThree}</p>}
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
                                        {errors.stepFour && <p className="text-md text-red-600 py-2">{errors.stepFour}</p>}
                                    </div>
                                </section>
                            )}

                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                                <Button onClick={back} disabled={loading} variant="outline">
                                    Volver
                                </Button>
                                { step < STEPS.length - 1 ? (

                                    <Button
                                        onClick={next}
                                    >
                                        Siguiente
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                    >
                                        {loading ? "Procesando..." : "Solicitar turno"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    </main>
  )
}

export default DatesForm