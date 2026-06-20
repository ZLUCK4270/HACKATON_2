import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/components/Notification";
import { NavBar } from "@/components/NavBar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "El Sabrocito — Sistema de Gestión",
  description: "Sistema de gestión de El Sabrocito: platos, mesas, pedidos, comandas y tickets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body
        style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
        className="antialiased"
      >
        <NotificationProvider>
          <NavBar />
          <main
            style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}
          >
            {children}
          </main>
        </NotificationProvider>
      </body>
    </html>
  );
}
