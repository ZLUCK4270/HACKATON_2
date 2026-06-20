"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { UtensilsCrossed, Table2, ClipboardList, ChefHat, Receipt, RefreshCw, ArrowRight, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { useNotification } from "@/components/Notification";
import { SkeletonCard } from "@/components/LoadingSpinner";

interface DashboardData {
  platos: number;
  mesas: number;
  pedidos: number;
  comandas: number;
  tickets: number;
}

const statCards = [
  { key: "platos"   as const, label: "Platos",   sub: "en el menú",  href: "/platos",   Icon: UtensilsCrossed, accent: "#f59e0b", glow: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.25)", bg: "rgba(245,158,11,0.06)" },
  { key: "mesas"    as const, label: "Mesas",    sub: "registradas", href: "/mesas",    Icon: Table2,          accent: "#10b981", glow: "rgba(16,185,129,0.18)", border: "rgba(16,185,129,0.25)", bg: "rgba(16,185,129,0.06)" },
  { key: "pedidos"  as const, label: "Pedidos",  sub: "en total",    href: "/pedidos",  Icon: ClipboardList,   accent: "#3b82f6", glow: "rgba(59,130,246,0.18)", border: "rgba(59,130,246,0.25)", bg: "rgba(59,130,246,0.06)" },
  { key: "comandas" as const, label: "Comandas", sub: "de cocina",   href: "/comandas", Icon: ChefHat,         accent: "#f97316", glow: "rgba(249,115,22,0.18)", border: "rgba(249,115,22,0.25)", bg: "rgba(249,115,22,0.06)" },
  { key: "tickets"  as const, label: "Tickets",  sub: "generados",   href: "/tickets",  Icon: Receipt,         accent: "#8b5cf6", glow: "rgba(139,92,246,0.18)", border: "rgba(139,92,246,0.25)", bg: "rgba(139,92,246,0.06)" },
];

export default function Dashboard() {
  const [data, setData]         = useState<DashboardData>({ platos: 0, mesas: 0, pedidos: 0, comandas: 0, tickets: 0 });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { notify } = useNotification();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [platos, mesas, pedidos, comandas, tickets] = await Promise.all([
        api("/platos"), api("/mesas"), api("/pedidos"), api("/comandas"), api("/tickets"),
      ]);
      setData({
        platos:   Array.isArray(platos)   ? platos.length   : 0,
        mesas:    Array.isArray(mesas)    ? mesas.length    : 0,
        pedidos:  Array.isArray(pedidos)  ? pedidos.length  : 0,
        comandas: Array.isArray(comandas) ? comandas.length : 0,
        tickets:  Array.isArray(tickets)  ? tickets.length  : 0,
      });
      setLastUpdate(new Date());
      setError(false);
    } catch {
      setError(true);
      notify("Error al cargar el dashboard", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 0" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <Zap size={48} color="#ef4444" />
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ef4444", margin: "0 0 0.5rem" }}>Error de conexión</h1>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>
          No se pudo conectar con el backend en{" "}
          <code style={{ color: "var(--gold)", background: "rgba(245,158,11,0.1)", padding: "2px 6px", borderRadius: "4px" }}>
            {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}
          </code>
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)" }}>
              El Sabrocito
            </p>
            <h1 style={{
              margin: 0, fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #f5f5f5 0%, #a1a1aa 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Dashboard
            </h1>
            {lastUpdate && (
              <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Actualizado: {lastUpdate.toLocaleTimeString("es-PE")}
              </p>
            )}
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "9px 18px", borderRadius: "8px",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              color: "#f59e0b", fontSize: "0.85rem", fontWeight: 600,
              opacity: loading ? 0.6 : 1, cursor: "pointer",
            }}
          >
            <RefreshCw size={15} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
        {loading
          ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
          : statCards.map(({ key, label, sub, href, Icon, accent, glow, border, bg }) => (
              <Link key={key} href={href} style={{ textDecoration: "none" }}>
                <div
                  style={{ background: bg, border: `1px solid ${border}`, borderRadius: "var(--radius-lg)", padding: "1.5rem", transition: "all 0.25s", cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${glow}`;
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {label}
                    </p>
                    <div style={{ padding: "8px", borderRadius: "8px", background: `${accent}18` }}>
                      <Icon size={20} color={accent} />
                    </div>
                  </div>
                  <p style={{ margin: "0 0 4px", fontSize: "3rem", fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: "-0.02em" }}>
                    {data[key]}
                  </p>
                  <p style={{ margin: "0 0 1.25rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>{sub}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: 600, color: accent }}>
                    Ver detalle <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
      </div>

      {/* Estado del Sistema */}
      {!loading && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
          <h2 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Estado del Sistema
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
            {statCards.map(({ key, label, Icon, accent }) => (
              <div key={key} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "14px", borderRadius: "10px",
                background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
              }}>
                <div style={{ padding: "8px", borderRadius: "8px", background: `${accent}18`, flexShrink: 0 }}>
                  <Icon size={18} color={accent} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}</p>
                  <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: accent }}>{data[key]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
