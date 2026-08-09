import React from 'react'
import { FaAngleDown } from "react-icons/fa";

type Props = {
    children: React.ReactNode;
}

function Select({children}: Props) {
  return (
    <div className="relative w-full rounded-2xl border border-[#d8cabd] bg-white px-4 py-3 text-sm text-[#1f1a16] outline-none transition focus-within:border-[#b56b49] focus-within:ring-2 focus-within:ring-[#b56b49]/15">
        {children}
        <FaAngleDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7a5a46]" />
    </div>
  )
}

export default Select