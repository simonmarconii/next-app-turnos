import { DateType } from "@/types/date";

type Props = {
    date: DateType;
}

function DateCard({ date }: Props) {
  return (
    <div
        className="rounded-2xl border border-[#e4d6c8] bg-white px-4 py-3 shadow-sm"
    >
        <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#1f1a16]">
                Dia:
            </p>
            <p className="text-sm font-medium text-[#1f1a16]">
                {new Date(date.date).toLocaleDateString("es-AR", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })}
            </p>
        </div>
        <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#1f1a16]">
                Hora:
            </p>
            <p className="text-sm font-medium text-[#1f1a16]">
                {new Date(date.date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
            </p>
        </div>
        <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#1f1a16]">
                Cliente:
            </p>
            <p className="text-sm font-medium text-[#1f1a16]">
                {date.user.name} {date.user.lastname}
            </p>
        </div>
        <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#1f1a16]">
                Servicio:
            </p>
            <p className="text-sm font-medium text-[#1f1a16]">
                {date.service.name} - ${date.service.price}
            </p>
        </div>
    </div>
  )
}

export default DateCard