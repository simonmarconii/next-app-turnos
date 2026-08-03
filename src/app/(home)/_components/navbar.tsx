import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 border-b border-[#d8ccb9]/80 bg-[#f6f1e8]/92 backdrop-blur-md">
            <div className="mx-auto flex items-center justify-between px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                <Link href="/" className="space-y-1">
                    <p className="text-3xl font-semibold uppercase tracking-[0.16em] text-[#6f8f82] hover:text-[#4a6d5d] md:text-4xl lg:text-6xl">
                        Pedicura Virginia
                    </p>
                </Link>
                <Link href="/login" className="text-sm font-medium">
                    <FaUserCircle className="text-[#6f8f82] hover:text-[#4a6d5d] text-5xl lg:text-6xl" />
                </Link>
            </div>
        </nav>
    );
}