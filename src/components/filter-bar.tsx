import Link from "next/link";

type Filter = "all" | "confirmed" | "completed";

type Props = {
  activeFilter: Filter;
};

const filters: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "confirmed", label: "Confirmados" },
  { value: "completed", label: "Completados" },
];

function FilterBar({ activeFilter }: Props) {
  return (
    <div className="flex flex-wrap gap-2 items-center py-2 lg:py-2.5" aria-label="Filtrar turnos">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;

        return (
          <Link
            key={filter.value}
            href={`/admin?search_dates=${filter.value}`}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex rounded-full px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#914b32] ${isActive ? "bg-[#914b32] text-[#fff8f1] hover:bg-[#7d3f2b]" : "border border-[#d8cabd] text-[#4d4037] hover:bg-[#efe6d8]"}`}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}

export default FilterBar;
