import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { AuthProvider } from "./_context/auth-provider";
import { ServiceProvider } from "./_context/service-provider";
import { DateProvider } from "./_context/date-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pedicuria Virginia",
  description: "Aplicacion para gestion de turnos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <AuthProvider>
          <ServiceProvider>
            <DateProvider>
              <Navbar />
              <main className="flex-1 pt-[var(--nav-height)]">{children}</main>
            </DateProvider>
          </ServiceProvider>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
