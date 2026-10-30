import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Fonte oficial da marca (guia de identidade). Usada no slide, que e material
// de reuniao, e no logotipo — o resto do painel segue em Geist.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cockpit SPWR | PWR Gestão",
  description: "Painel de acompanhamento de contratos, renovações e clientes da PWR Gestão.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full bg-[#f7f8fa] text-foreground">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </body>
    </html>
  );
}
