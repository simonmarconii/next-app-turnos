import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-[#d8ccb9]/80 bg-[#f1e8dc]">
            <div className="mx-auto grid gap-6 px-4 py-8 text-sm text-[#4c4037] sm:px-6 lg:grid-cols-2 lg:px-8">
                <div className="flex gap-2">
                    <p className="text-lg font-semibold uppercase tracking-[0.16em] text-[#6f8f82]">
                        Pedicura Virginia
                    </p>
                    <p className="text-lg">
                        2026 | Todos los derechos reservados.
                    </p>
                </div>

                <div className="flex flex-col gap-2 lg:items-end">
                    <p className="text-lg">
                        Diseñado y desarrollado por{" "}
                        <Link href="/" className="font-semibold text-[#b56b49] underline underline-offset-4">
                            Simon
                        </Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}