import React from 'react'
import { FaAngleDown } from "react-icons/fa";

type Props = {
    children: React.ReactNode;
    disabled?: boolean;
}

function Select({ children, disabled = false }: Props) {
  return (
    <div className={`relative w-full rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition hover:border-[#b56b49] focus-within:border-[#b56b49] focus-within:ring-2 focus-within:ring-[#b56b49]/15 ${disabled ? "cursor-not-allowed bg-[#f4e7da] opacity-70" : ""}`}>
        {children}
        <FaAngleDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7a5a46]" aria-hidden="true" />
    </div>
  )
}

export default Select
