"use client";

import { useState, FormEvent } from "react";
import Button from "./button";
import { ServiceType } from "@/types/service";
import { useRouter } from "next/navigation";

interface ServicesClientProps {
  initialServices: ServiceType[];
}

export default function ServicesClient({
  initialServices,
}: ServicesClientProps) {
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  const [deletingService, setDeletingService] = useState<ServiceType | null>( null);
  const [editForm, setEditForm] = useState({ price: 0 });
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleDeleteService(serviceId: string) {
    try {
      const response = await fetch(`/api/service/${serviceId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete service");
      }

      setDeletingService(null);
      router.refresh();
    } catch (error) {
      throw new Error("Failed to delete service: " + error);
    }
  }

  async function handleUpdateService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingService) return;
    setError(null);

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
        const data = await response.json();
        setError(data.error);
      } else {
        setEditingService(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update service: " + error);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {initialServices.length > 0 &&
          initialServices.map((service) => (
            <div
              key={service.id}
              className="flex flex-col gap-4 rounded-2xl border border-[#d8cabd] bg-white p-4 shadow-sm"
            >
              <div>
                <p className="text-base font-semibold text-[#1f1a16]">
                  {service.name}
                </p>
                <p className="mt-1 text-sm text-[#4d4037]">${service.price}</p>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  onClick={() => {
                    setEditingService(service);
                    setEditForm({ price: service.price });
                  }}
                  size="medium"
                >
                  Editar
                </Button>
                <Button
                  onClick={() => setDeletingService(service)}
                  variant="destructive"
                  size="medium"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
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
                <label className="text-sm font-semibold text-[#4d4037]">
                  Precio
                </label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                />
                {error && (
                  <div className="text-lg text-red-600">
                      {error}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  onClick={() => setEditingService(null)}
                  variant="outline"
                  size="medium"
                >
                  Cancelar
                </Button>
                <Button type="submit" size="medium">
                  Guardar cambios
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a16]/60 px-4 py-6">
          <div className="w-full max-w-md rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb] p-6 shadow-[0_20px_50px_rgba(31,26,22,0.18)]">
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8f82]">
                    Eliminar servicio
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-[#1f1a16]">
                    ¿Desea eliminar {deletingService.name}?
                  </h2>
                </div>
              </div>
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
                <Button
                  onClick={() => setDeletingService(null)}
                  variant="outline"
                  size="medium"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleDeleteService(deletingService.id)}
                  variant="destructive"
                  size="medium"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
