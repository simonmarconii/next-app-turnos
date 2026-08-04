import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#6f8f82]">
            <div className="mx-auto grid gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8">
                <div className="flex gap-2">
                    <p className="text-lg font-semibold uppercase tracking-[0.16em] text-[#f6f1e8]/92">
                        Pedicuria Virginia
                    </p>
                    <p className="text-lg text-[#1f1a16]">
                        2026 | Todos los derechos reservados.
                    </p>
                </div>

                <div className="flex flex-col gap-2 lg:items-end">
                    <p className="text-lg text-[#1f1a16]">
                        Diseñado y desarrollado por{" "}
                        <Link href="mailto:marconisimon21@gmail.com" className="font-semibold underline underline-offset-4">
                            Simon
                        </Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}