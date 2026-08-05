import Image from "next/image";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

export default function HomePage() {
  return (
    <main className="flex w-full flex-col">
      <section className="relative flex min-h-[calc(100svh-var(--nav-height))] scroll-mt-[var(--nav-height)] items-center overflow-hidden">
        <Image
          className="object-cover"
          src="/lima-pedicura.jpg"
          alt="Pie"
          fill
          loading="eager"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#1f1a16]/52" />
        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl rounded-[2rem] border border-white/20 bg-[#f8f3eb]/90 p-6 text-[#1f1a16] shadow-[0_24px_70px_rgba(0,0,0,0.2)] backdrop-blur-md sm:p-8 lg:p-10">
            <p className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Disfruta de un espacio pensado para una atención prolija, tranquila y con foco en la higiene.
            </p>
            <div className="mt-8">
              <a
                href="/turnos"
                className="inline-flex items-center justify-center rounded-full bg-[#b56b49] px-8 py-4 text-base font-semibold text-[#fff8f1] shadow-lg shadow-[#b56b49]/20 transition hover:bg-[#a95f40]"
              >
                Reservar turno
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="flex min-h-[calc(100svh-var(--nav-height))] scroll-mt-[var(--nav-height)] items-center py-16">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8 lg:gap-14">
          <div className="flex justify-center lg:justify-start">
            <p className="max-w-3xl text-center text-4xl font-semibold tracking-tight text-[#1f1a16] sm:text-5xl lg:text-left lg:text-7xl">
              ¿Qué hacemos?
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex min-h-[14rem] flex-col items-center justify-center rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb]/95 p-6 text-center shadow-[0_16px_36px_rgba(31,26,22,0.07)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(31,26,22,0.12)] sm:p-8 lg:p-10">
              <p className="text-[1.45rem] font-semibold leading-tight text-[#1f1a16] sm:text-[1.7rem] lg:text-[1.9rem]">
                Corte de uñas.
              </p>
            </div>
            <div className="flex min-h-[14rem] flex-col items-center justify-center rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb]/95 p-6 text-center shadow-[0_16px_36px_rgba(31,26,22,0.07)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(31,26,22,0.12)] sm:p-8 lg:p-10">
              <p className="text-[1.45rem] font-semibold leading-tight text-[#1f1a16] sm:text-[1.7rem] lg:text-[1.9rem]">
                Onicomicosis
              </p>
              <p className="mt-2 text-[1rem] text-[#5c4f44] sm:text-[1.05rem]">
                (hongos en uñas).
              </p>
            </div>
            <div className="flex min-h-[14rem] flex-col items-center justify-center rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb]/95 p-6 text-center shadow-[0_16px_36px_rgba(31,26,22,0.07)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(31,26,22,0.12)] sm:p-8 lg:p-10">
              <p className="text-[1.45rem] font-semibold leading-tight text-[#1f1a16] sm:text-[1.7rem] lg:text-[1.9rem]">
                Onicocriptosis
              </p>
              <p className="mt-2 text-[1rem] text-[#5c4f44] sm:text-[1.05rem]">
                (uñas encarnadas).
              </p>
            </div>
            <div className="flex min-h-[14rem] flex-col items-center justify-center rounded-[2rem] border border-[#d8cabd] bg-[#f8f3eb]/95 p-6 text-center shadow-[0_16px_36px_rgba(31,26,22,0.07)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(31,26,22,0.12)] sm:p-8 lg:p-10">
              <p className="text-[1.45rem] font-semibold leading-tight text-[#1f1a16] sm:text-[1.7rem] lg:text-[1.9rem]">
                Hiperqueratosis
              </p>
              <p className="mt-2 text-[1rem] text-[#5c4f44] sm:text-[1.05rem]">
                (durezas, callosidades, helomas).
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="flex min-h-[calc(100svh-var(--nav-height))] scroll-mt-[var(--nav-height)] items-center bg-[#6f8f82] py-16">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 text-[#1f1a16] sm:px-6 lg:px-8 lg:gap-14">
          <div className="flex justify-center lg:justify-start">
            <p className="text-center text-4xl font-semibold tracking-tight lg:text-left lg:text-7xl">
              Encontranos
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex items-center gap-4 rounded-[2rem] border border-[#1f1a16]/10 bg-[#f8f3eb]/90 px-5 py-4 shadow-[0_16px_36px_rgba(31,26,22,0.08)]">
              <FaInstagram className="text-2xl lg:text-3xl" />
              <a href="https://www.instagram.com/pedicuria_virginia" target="_blank" rel="noopener noreferrer" className="text-lg font-medium lg:text-xl">@pedicuria_virginia</a>
            </div>
            <div className="flex items-center gap-4 rounded-[2rem] border border-[#1f1a16]/10 bg-[#f8f3eb]/90 px-5 py-4 shadow-[0_16px_36px_rgba(31,26,22,0.08)]">
              <FaWhatsapp className="text-2xl lg:text-3xl" />
              <a href="https://wa.me/5492914432920" target="_blank" rel="noopener noreferrer" className="text-lg font-medium lg:text-xl">+54 9 291 443-2920</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
