import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import LogoutButton from "./logout-button";
import { getUser } from "@/lib/get-user";
import { isAdmin } from "@/lib/auth";

export default async function Navbar() {
  const user = await getUser();
  const admin = isAdmin(user);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#d8ccb9]/80 bg-[#f6f1e8]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[var(--nav-height)] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="rounded-sm transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#914b32]"
        >
          <p className="text-lg font-semibold text-[#4f6d60] sm:text-xl">
            Pedicuria Virginia
          </p>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/turnos"
            className="whitespace-nowrap rounded-full bg-[#914b32] px-4 py-2.5 text-sm font-semibold text-[#fff8f1] shadow-[0_8px_18px_rgba(145,75,50,0.22)] hover:bg-[#7d3f2b] sm:px-5"
          >
            Sacá tu turno
          </Link>
          {admin ? (
            <>
              <Link
                href="/admin"
                className="rounded-full bg-[#914b32] px-4 py-2.5 text-sm font-semibold text-[#fff8f1] transition hover:bg-[#7d3f2b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#914b32]"
              >
                Panel
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              aria-label="Ingresar al panel"
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#4d4037] transition hover:bg-[#e7ece4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#914b32]"
            >
              <FaUserCircle
                className="text-2xl text-[#4f6d60] sm:text-3xl"
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Ingresar</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
