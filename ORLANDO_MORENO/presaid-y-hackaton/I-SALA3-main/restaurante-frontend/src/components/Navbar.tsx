"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Utensils, ClipboardList, Layers, Receipt, Home, Settings } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/platos", label: "Platos", icon: Utensils },
    { href: "/mesas", label: "Mesas", icon: Layers },
    { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
    { href: "/comandas", label: "Cocina (Comandas)", icon: ClipboardList },
    { href: "/tickets", label: "Tickets/Facturas", icon: Receipt },
  ];

  return (
    <nav className="bg-slate-900 text-slate-100 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <Utensils className="h-8 w-8 text-emerald-400" />
              <span className="font-bold text-xl tracking-wider text-white">GustoResto</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-slate-800 text-emerald-400 border-b-2 border-emerald-400 rounded-b-none"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="text-sm font-medium text-slate-400">
            Día 4 — MVP
          </div>
        </div>
      </div>
      {/* Mobile menu, show/hide based on menu state. */}
      <div className="md:hidden border-t border-slate-800">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-wrap gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                  isActive
                    ? "bg-slate-800 text-emerald-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
