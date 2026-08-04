"use client";

import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "@/app/_context/auth-provider";

export default function Navbar() {
    const { user, logout } = useAuth();

    async function handleLogout() {
        await logout();
    }

    return (
        <nav className="sticky top-0 z-50 border-b border-[#d8ccb9]/80 bg-[#f6f1e8]/92 backdrop-blur-md">
            <div className="mx-auto flex items-center justify-between px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                <Link href="/" className="">
                    <p className="text-3xl font-semibold uppercase tracking-[0.14em] text-[#6f8f82] hover:text-[#4a6d5d] md:text-4xl lg:text-6xl">
                        Pedicuria Virginia
                    </p>
                </Link>
                { user ? (
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="rounded-[2rem] bg-[#b56b49] px-5 py-3 text-sm font-semibold text-[#fff8f1] transition hover:bg-[#a95f40]">
                            Admin
                        </Link>
                        <button 
                            className="rounded-[2rem] bg-[#b56b49] px-5 py-3 text-sm font-semibold text-[#fff8f1] transition hover:bg-[#a95f40]"
                            onClick={handleLogout}
                        >
                            <p>Logout</p>
                        </button>
                    </div>
                ) : (
                    <Link href="/login" className="text-sm font-medium">
                        <FaUserCircle className="text-[#6f8f82] hover:text-[#4a6d5d] text-4xl lg:text-5xl" />
                    </Link>
                )}
            </div>
        </nav>
    );
}