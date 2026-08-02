import Image from "next/image";

export default function HomePage() {
  return (
    <main className="mx-auto w-full flex flex-col">
      <section className="relative min-h-[32rem] overflow-hidden lg:min-h-[51rem]">
        <Image
          className="object-cover"
          src="/lima-pedicura.jpg"
          alt="Pie"
          fill
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#1f1a16]/45" />
        <div className="relative z-10 flex min-h-[32rem] items-center px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
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
      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-25">
        <p className="text-5xl lg:text-8xl font-medium text-[#1f1a16]">
          ¿Que hacemos?
        </p>
      </section>
    </main>
  );
}
