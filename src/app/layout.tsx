import type { Metadata } from "next";
import { Archivo, Archivo_Black } from "next/font/google";
import { meta } from "@/content/copy";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-archivo" });
const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-archivo-black" });

export const metadata: Metadata = {
  title: meta.titel,
  description: meta.beschreibung,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${archivo.variable} ${archivoBlack.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
