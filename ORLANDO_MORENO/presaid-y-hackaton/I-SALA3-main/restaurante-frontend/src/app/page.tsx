"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Utensils, Layers, ClipboardList, Receipt, ChefHat, CheckCircle, ShieldAlert, ArrowRight } from "lucide-react";

interface SummaryData {
  platosCount: number;
  mesasCount: number;
  pedidosCount: number;
  comandasCount: number;
  ticketsCount: number;
}

export default function Dashboard() {
  const [data, setData] = useState<SummaryData>({
    platosCount: 0,
    mesasCount: 0,
    pedidosCount: 0,
    comandasCount: 0,
    ticketsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        setError(null);

        // Fetch data from backend API
        const [platosRes, mesasRes, pedidosRes, comandasRes, ticketsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/platos`).then((r) => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/mesas`).then((r) => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/pedidos`).then((r) => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/comandas`).then((r) => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/tickets`).then((r) => r.json()),
        ]);

        setData({
          platosCount: Array.isArray(platosRes) ? platosRes.length : 0,
          mesasCount: Array.isArray(mesasRes) ? mesasRes.length : 0,
          pedidosCount: Array.isArray(pedidosRes) ? pedidosRes.length : 0,
          comandasCount: Array.isArray(comandasRes) ? comandasRes.length : 0,
          ticketsCount: Array.isArray(ticketsRes) ? ticketsRes.length : 0,
        });
      } catch (err: any) {
        console.error("Error fetching summary data:", err);
        setError("No se pudo conectar con el servidor backend (http://localhost:3000). Asegúrate de que el backend esté iniciado.");
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            Dashboard del Restaurante
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Resumen en tiempo real del estado de tu negocio gastronómico.
          </p>
        </div>
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping mr-2"></span>
            Servicio Activo
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 flex gap-3 text-red-200">
          <ShieldAlert className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-400">Error de Conexión</h4>
            <p className="text-sm text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Platos */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Platos Activos</span>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Utensils className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">
              {loading ? "..." : data.platosCount}
            </span>
          </div>
        </div>

        {/* Mesas */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Total Mesas</span>
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">
              {loading ? "..." : data.mesasCount}
            </span>
          </div>
        </div>

        {/* Pedidos */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Pedidos Totales</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">
              {loading ? "..." : data.pedidosCount}
            </span>
          </div>
        </div>

        {/* Comandas */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">En Cocina</span>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <ChefHat className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">
              {loading ? "..." : data.comandasCount}
            </span>
          </div>
        </div>

        {/* Tickets */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Facturas / Tickets</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">
              {loading ? "..." : data.ticketsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions & Navigation */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Secciones de Gestión</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Platos Link */}
          <Link href="/platos" className="group block bg-slate-900 hover:bg-slate-800/60 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-emerald-950/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 rounded-xl transition-colors">
                <Utensils className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Carta de Platos</h3>
            <p className="text-sm text-slate-400">Administra los platillos disponibles, precios, crea nuevos ítems o cambia su disponibilidad en la carta.</p>
          </Link>

          {/* Mesas Link */}
          <Link href="/mesas" className="group block bg-slate-900 hover:bg-slate-800/60 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-emerald-950/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 rounded-xl transition-colors">
                <Layers className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Control de Mesas</h3>
            <p className="text-sm text-slate-400">Supervisa la distribución de mesas, cambia el estado de disponibilidad (Disponible, Ocupada, Reservada) y añade nuevas mesas.</p>
          </Link>

          {/* Pedidos Link */}
          <Link href="/pedidos" className="group block bg-slate-900 hover:bg-slate-800/60 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-emerald-950/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 rounded-xl transition-colors">
                <ClipboardList className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Pedidos de Clientes</h3>
            <p className="text-sm text-slate-400">Genera nuevos pedidos vinculando las mesas a múltiples platos. Revisa los montos a pagar y los estados de envío de comida.</p>
          </Link>

          {/* Cocina Link */}
          <Link href="/comandas" className="group block bg-slate-900 hover:bg-slate-800/60 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-emerald-950/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 rounded-xl transition-colors">
                <ChefHat className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Cocina & Comandas</h3>
            <p className="text-sm text-slate-400">La vista interna de los cocineros. Organiza las comandas, atiende las observaciones (ej. "sin cebolla") y actualiza la preparación de los platillos.</p>
          </Link>

          {/* Tickets Link */}
          <Link href="/tickets" className="group block bg-slate-900 hover:bg-slate-800/60 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-emerald-950/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 rounded-xl transition-colors">
                <Receipt className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Caja & Facturación</h3>
            <p className="text-sm text-slate-400">Genera boletas acumulando todas las órdenes pendientes por mesa, gestiona los pagos con tarjeta o efectivo y emite los recibos correspondientes.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
