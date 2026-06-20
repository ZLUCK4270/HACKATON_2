"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, Table2, ClipboardList, ChefHat, Receipt } from "lucide-react";

const navLinks = [
  { href: "/",         label: "Dashboard", icon: LayoutDashboard },
  { href: "/platos",   label: "Platos",    icon: UtensilsCrossed },
  { href: "/mesas",    label: "Mesas",     icon: Table2 },
  { href: "/pedidos",  label: "Pedidos",   icon: ClipboardList },
  { href: "/comandas", label: "Comandas",  icon: ChefHat },
  { href: "/tickets",  label: "Tickets",   icon: Receipt },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(13,13,13,0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "9px",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 14px rgba(245,158,11,0.35)",
              }}>
                <UtensilsCrossed size={18} color="#fff" />
              </div>
              <span style={{
                fontWeight: 700, fontSize: "1rem",
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                letterSpacing: "-0.01em",
              }}>El Sabrocito</span>
            </div>
          </Link>

          {/* Links */}
          <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "7px 13px", borderRadius: "8px",
                    fontSize: "0.82rem", fontWeight: 500,
                    transition: "all 0.2s",
                    background: active ? "rgba(245,158,11,0.15)" : "transparent",
                    color: active ? "#fbbf24" : "rgba(255,255,255,0.55)",
                    border: active ? "1px solid rgba(245,158,11,0.3)" : "1px solid transparent",
                  }}>
                    <Icon size={14} />
                    {label}
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </div>
    </nav>
  );
}
