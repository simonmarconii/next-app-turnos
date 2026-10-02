"use client";

import { useState, FormEvent } from "react";
import Button from "./button";
import { ServiceType } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { deleteService, updateService } from "@/lib/actions";

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
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  async function handleDeleteService(serviceId: string) {
    try {
      if (submitting) return;
      setSubmitting(true);
      const result = await deleteService(serviceId);

      if (!result.success) {
        console.error("Failed to delete service", result.error);
        return;
      }

      setDeletingService(null);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete service:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingService) return;
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await updateService(editingService.id, editForm.price);

      if (!result.success) {
        setError(result.error);
      } else {
        setEditingService(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update service: " + error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {initialServices.length > 0 ?
          initialServices.map((service) => (
            <div
              key={service.id}
              className="flex flex-col gap-4 rounded-2xl border border-[#cdbfae] bg-white p-4 shadow-sm"
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
          )) : (
            <div className="rounded-2xl border border-dashed border-[#cdbfae] bg-[#f8f3eb] px-5 py-8 text-center sm:col-span-2 md:col-span-3">
              <p className="text-base font-semibold text-[#1f1a16]">Todavía no hay servicios cargados.</p>
              <p className="mt-1 text-sm leading-6 text-[#5c4f44]">Agregá el primer servicio para verlo en el panel.</p>
            </div>
          )}
      </div>

      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a16]/70 px-4 py-6 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-service-title"
            tabIndex={-1}
            className="w-full max-w-md overflow-hidden rounded-[2rem] border border-[#cdbfae] bg-[#f8f3eb] shadow-[0_24px_70px_rgba(31,26,22,0.24)]"
          >
            <div className="border-b border-[#d8cabd] bg-gradient-to-br from-[#eef3ec] to-[#f4e7da] px-6 py-6 sm:px-8">
              <p className="text-sm font-semibold text-[#4f6d60]">
                  Editar servicio
              </p>
              <h2 id="edit-service-title" className="mt-2 text-2xl font-semibold tracking-tight text-[#1f1a16]">
                  {editingService.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5c4f44]">
                Actualizá el precio sin modificar el nombre del servicio.
              </p>
            </div>

            <form className="space-y-5 p-6 sm:p-8" onSubmit={handleUpdateService}>
              <div className="flex flex-col gap-2">
                <label htmlFor="edit-service-price" className="text-sm font-semibold text-[#4d4037]">
                  Precio
                </label>
                <input
                  id="edit-service-price"
                  type="number"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="rounded-2xl border border-[#cdbfae] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus:border-[#b56b49] focus:ring-2 focus:ring-[#b56b49]/15"
                />
                {error && (
                  <div role="alert" className="text-lg text-[#b42318]">
                      {error}
                  </div>
                )}
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-[#d8cabd] pt-5 sm:flex-row sm:justify-end">
                <Button
                  onClick={() => setEditingService(null)}
                  variant="outline"
                  size="medium"
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="medium" disabled={submitting}>
                  Guardar cambios
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a16]/70 px-4 py-6 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-service-title"
            tabIndex={-1}
            className="w-full max-w-md overflow-hidden rounded-[2rem] border border-[#cdbfae] bg-[#f8f3eb] shadow-[0_24px_70px_rgba(31,26,22,0.24)]"
          >
            <div className="flex flex-col">
              <div className="border-b border-[#e8b5ae] bg-[#fff1ef] px-6 py-6 sm:px-8">
                  <p className="text-sm font-semibold text-[#b42318]">
                    Eliminar servicio
                  </p>
                  <h2 id="delete-service-title" className="mt-2 text-2xl font-semibold tracking-tight text-[#1f1a16]">
                    ¿Desea eliminar {deletingService.name}?
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#5c4f44]">
                    Esta acción no se puede deshacer.
                  </p>
              </div>
              <div className="flex w-full flex-col-reverse gap-3 p-6 sm:flex-row sm:justify-end sm:p-8">
                <Button
                  onClick={() => setDeletingService(null)}
                  variant="outline"
                  size="medium"
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleDeleteService(deletingService.id)}
                  variant="destructive"
                  size="medium"
                  disabled={submitting}
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
