import Image from "next/image";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

export default function HomePage() {
  return (
    <main className="mx-auto w-full flex flex-col gap-12 lg:gap-[9.6rem]">
      <section className="relative min-h-[32rem] overflow-hidden lg:min-h-[52rem]">
        <Image
          className="object-cover"
          src="/lima-pedicura.jpg"
          alt="Pie"
          fill
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#1f1a16]/45" />
        <div className="relative z-10 flex min-h-[32rem] items-center px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-6 max-w-3xl rounded-[2rem] bg-[#f8f3eb]/88 p-6 text-[#1f1a16] shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:p-8 lg:p-10">
            <p className="max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Disfruta de un espacio pensado para una atención prolija, tranquila y
              con foco en la higiene.
            </p>
            <div className="">
              <a
                href="/turnos"
                className="inline-flex items-center justify-center rounded-full bg-[#b56b49] px-8 py-4 text-lg font-semibold text-[#fff8f1] shadow-lg shadow-[#b56b49]/20 transition hover:bg-[#a95f40]"
              >
                Reservar turno
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto flex w-full flex-col gap-12 px-4 sm:px-6 sm:py-16 lg:px-8 lg:gap-20">
        <div className="flex justify-center lg:justify-start">
          <p className="text-center text-5xl font-semibold tracking-tight text-[#1f1a16] lg:text-9xl lg:text-left">
            ¿Que hacemos?
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex h-full min-h-[12rem] flex-col items-center justify-center rounded-[2rem] border border-[#6f8f82] bg-[#f8f3eb]/90 p-6 text-center shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] sm:min-h-[13rem] sm:p-8 lg:p-10">
            <p className="text-[1.6rem] font-semibold leading-tight text-[#1f1a16] sm:text-[1.9rem] lg:text-[2.1rem]">
              Corte de uñas.
            </p>
          </div>
          <div className="flex h-full min-h-[12rem] flex-col items-center justify-center rounded-[2rem] border border-[#6f8f82] bg-[#f8f3eb]/90 p-6 text-center shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] sm:min-h-[13rem] sm:p-8 lg:p-10">
            <p className="text-[1.6rem] font-semibold leading-tight text-[#1f1a16] sm:text-[1.9rem] lg:text-[2.1rem]">
              Onicomicosis
            </p>
            <p className="mt-2 text-[1.1rem] text-[#4f433b] sm:text-[1.2rem]">
              (hongos en uñas).
            </p>
          </div>
          <div className="flex h-full min-h-[12rem] flex-col items-center justify-center rounded-[2rem] border border-[#6f8f82] bg-[#f8f3eb]/90 p-6 text-center shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] sm:min-h-[13rem] sm:p-8 lg:p-10">
            <p className="text-[1.6rem] font-semibold leading-tight text-[#1f1a16] sm:text-[1.9rem] lg:text-[2.1rem]">
              Onicocriptosis
            </p>
            <p className="mt-2 text-[1.1rem] text-[#4f433b] sm:text-[1.2rem]">
              (uñas encarnadas).
            </p>
          </div>
          <div className="flex h-full min-h-[12rem] flex-col items-center justify-center rounded-[2rem] border border-[#6f8f82] bg-[#f8f3eb]/90 p-6 text-center shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] sm:min-h-[13rem] sm:p-8 lg:p-10">
            <p className="text-[1.6rem] font-semibold leading-tight text-[#1f1a16] sm:text-[1.9rem] lg:text-[2.1rem]">
              Hiperqueratosis
            </p>
            <p className="mt-2 text-[1.1rem] text-[#4f433b] sm:text-[1.2rem]">
              (durezas, callosidades, helomas).
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto flex w-full flex-col gap-12 bg-[#6f8f82] rounded-t-[2rem] pt-6 lg:pt-10 lg:gap-20">
        <div className="flex justify-center lg:justify-start px-4 sm:px-6 lg:px-8 lg:gap-20">
          <p className="text-5xl font-semibold tracking-tight text-[#1f1a16] lg:text-9xl">
            Encontranos
          </p>
        </div>
        <div className="flex flex-col gap-4 px-4 sm:px-6 lg:px-8 lg:pb-[7rem]">
          <div className="flex items-center gap-4">
            <FaInstagram className="text-2xl lg:text-3xl" /> 
            <a href="https://www.instagram.com/pedicuria_virginia" target="_blank" rel="noopener noreferrer" className="text-xl lg:text-2xl">@pedicuria_virginia</a>
          </div>
          <div className="flex items-center gap-4">
            <FaWhatsapp className="text-2xl lg:text-3xl" />
            <a href="https://wa.me/5492914432920" target="_blank" rel="noopener noreferrer" className="text-xl lg:text-2xl">+54 9 291 443-2920</a>
          </div>
        </div>
      </section>
    </main>
  );
}
