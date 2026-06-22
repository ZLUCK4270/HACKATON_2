import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema de Restaurante",
  description: "Panel de gestión del restaurante",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
            <Link href="/" className="font-bold text-lg text-orange-600">
              Restaurante
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/platos" className="hover:text-orange-600 transition">Platos</Link>
              <Link href="/mesas" className="hover:text-orange-600 transition">Mesas</Link>
              <Link href="/pedidos" className="hover:text-orange-600 transition">Pedidos</Link>
              <Link href="/comandas" className="hover:text-orange-600 transition">Comandas</Link>
              <Link href="/tickets" className="hover:text-orange-600 transition">Tickets</Link>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
