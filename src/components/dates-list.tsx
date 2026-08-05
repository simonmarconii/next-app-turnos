import { useDate } from "@/app/_context/date-provider";

export default function DatesList() {
    const { dates, loading } = useDate();

    return (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {
                loading ? (
                    <div>
                        <p>Loading...</p>
                    </div>
                ) : (
                    <>
                        {dates && (
                            dates.map((date) => (
                                <div
                                    key={date.id}
                                    className="rounded-2xl border border-[#e4d6c8] bg-white px-4 py-3 shadow-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-[#1f1a16]">
                                            Dia:
                                        </p>
                                        <p className="text-sm font-medium text-[#1f1a16]">
                                            {new Date(date.date).toLocaleDateString("es-AR", { weekday: "long", month: "long", day: "numeric" })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-[#1f1a16]">
                                            Hora:
                                        </p>
                                        <p className="text-sm font-medium text-[#1f1a16]">
                                            {new Date(date.date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-sm text-[#1f1a16]">
                                            Cliente:
                                        </p>
                                        <p className="text-sm font-medium text-[#1f1a16]">
                                            {date.user.name} {date.user.lastname} - {date.user.email}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-[#1f1a16]">
                                            Servicio:
                                        </p>
                                        <p className="text-sm font-medium text-[#1f1a16]">
                                            {date.service.name} - ${date.service.price}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )
            }
        </div>
    )
}