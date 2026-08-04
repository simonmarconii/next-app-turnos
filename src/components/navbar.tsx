"use client";

import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "@/app/_context/auth-provider";
import Button from "@/components/button";

export default function Navbar() {
    const { user, logout } = useAuth();

    async function handleLogout() {
        await logout();
    }

    return (
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#d8ccb9]/80 bg-[#f6f1e8]/90 backdrop-blur-xl">
            <div className="mx-auto flex h-[var(--nav-height)] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="transition-opacity hover:opacity-85">
                    <p className="text-lg font-semibold uppercase tracking-[0.18em] text-[#6f8f82] sm:text-xl">
                        Pedicuria Virginia
                    </p>
                </Link>
                { user ? (
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link href="/admin" className="rounded-full bg-[#b56b49] px-4 py-2.5 text-sm font-semibold text-[#fff8f1] transition hover:bg-[#a95f40]">
                            Admin
                        </Link>
                        <Button variant="secondary" size="small" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                ) : (
                    <Link href="/login" className="text-sm font-medium">
                        <FaUserCircle className="text-3xl text-[#6f8f82] transition-colors hover:text-[#4a6d5d] sm:text-4xl" />
                    </Link>
                )}
            </div>
        </nav>
    );
}