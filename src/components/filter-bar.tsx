"use client";

import { useRouter } from "next/navigation";
import Button from "./button";

function FilterBar() {
  const router = useRouter();

  return (
    <div className="flex gap-2 items-center py-2 lg:py-2.5">
        <Button variant="outline" onClick={() => router.push("/admin?search_dates=all")}>
          Todos
        </Button>
        <Button variant="outline" onClick={() => router.push("/admin?search_dates=confirmed")}>
          Confirmados
        </Button>
        <Button variant="outline" onClick={() => router.push("/admin?search_dates=completed")}>
          Completados
        </Button>
    </div>
  );
}

export default FilterBar;
