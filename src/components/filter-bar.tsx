"use client";

import { useRouter } from "next/navigation";
import { FaAngleDown } from "react-icons/fa";

function FilterBar() {
  const router = useRouter();

  function handleFilterChange(event: React.ChangeEvent<HTMLSelectElement>) {
    event.preventDefault();
    const selectedValue = event.target.value;

    router.push(`?search_dates=${selectedValue}`);
  }

  return (
    <div className="flex gap-1 items-center rounded-full border border-[#e4d6c8] px-3 py-2 lg:px-4 lg:py-2.5">
        <select
        className="appearance-none focus:outline-none px-1 lg:px-2"
        onChange={handleFilterChange}
        >
            <option value="upcoming">Filtrar</option>
            <option value="all">Todos</option>
            <option value="past">Anteriores</option>
            <option value="upcoming">Próximos</option>
        </select>
        <FaAngleDown />
    </div>
  );
}

export default FilterBar;
