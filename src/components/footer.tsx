import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-[#d8ccb9]/80 bg-[#e7ece4]">
            <div className="mx-auto grid gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6f8f82]">
                        Pedicuria Virginia
                    </p>
                    <p className="text-sm text-[#4d4037]">
                        2026 | Todos los derechos reservados.
                    </p>
                </div>

                <div className="flex flex-col gap-2 lg:items-end">
                    <p className="text-sm text-[#4d4037]">
                        Diseñado y desarrollado por{" "}
                        <Link href="mailto:marconisimon21@gmail.com" className="font-semibold text-[#1f1a16] underline underline-offset-4 transition hover:text-[#b56b49]">
                            Simon
                        </Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}