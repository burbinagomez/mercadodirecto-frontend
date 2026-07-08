import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/query-provider";

export const metadata: Metadata = {
  title: "MercadoDirecto",
  description: "Del campo a tu mesa — mercado directo de agricultores colombianos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
