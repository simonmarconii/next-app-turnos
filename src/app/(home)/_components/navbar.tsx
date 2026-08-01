import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 border-b border-[#d8ccb9]/80 bg-[#f6f1e8]/92 backdrop-blur-md">
            <div className="mx-auto flex items-center justify-between px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                <Link href="/" className="space-y-1">
                    <p className="text-3xl font-semibold uppercase tracking-[0.16em] text-[#6f8f82] lg:text-6xl">
                        Pedicura Virginia
                    </p>
                    <p className="text-sm font-medium text-[#2a241f]">
                        Un espacio pensado para una atención prolija, tranquila y con foco en la higiene.
                    </p>
                </Link>

                <div className="flex items-center gap-3">

                </div>
            </div>
        </nav>
    );
}