"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "🏠 Inicio" },
        { href: "/mesas", label: "🪑 Mesas" },
        { href: "/pedidos", label: "📋 Pedidos" },
        { href: "/comandas", label: "👨‍🍳 Comandas" },
        { href: "/tickets", label: "💳 Tickets" },
        { href: "/platos", label: "🍽️ Platos" },
    ];

    return (
        <nav className="bg-black border-b border-amber-500 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center gap-4">
                <h1 className="text-2xl font-bold text-amber-400 mr-6">
                    🍴 Restaurante
                </h1>

                {links.map((link) => {
                    const activo = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-4 py-2 rounded-lg transition-all ${activo
                                    ? "bg-amber-500 text-black font-bold"
                                    : "text-white hover:bg-gray-800"
                                }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}