"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

interface Plato {
  id: number;
  nombre: string;
  precio: number;
  disponible: boolean;
}

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: string;
}

interface Pedido {
  id: number;
  total: number;
  estado: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    platosCount: 0,
    mesasCount: 0,
    pedidosCount: 0,
    pedidosPendientes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setError(null);
        const [platosRes, mesasRes, pedidosRes] = await Promise.all([
          apiClient.get("/platos"),
          apiClient.get("/mesas"),
          apiClient.get("/pedidos"),
        ]);

        if (!platosRes.ok || !mesasRes.ok || !pedidosRes.ok) {
          throw new Error("Error al consultar la API del servidor.");
        }

        const platos: Plato[] = await platosRes.json();
        const mesas: Mesa[] = await mesasRes.json();
        const pedidos: Pedido[] = await pedidosRes.json();

        setStats({
          platosCount: platos.length,
          mesasCount: mesas.length,
          pedidosCount: pedidos.length,
          pedidosPendientes: pedidos.filter(p => p.estado === "pendiente" || p.estado === "en_preparacion").length,
        });
      } catch {
        setError(
          "No se pudo conectar con el servidor backend (NestJS). Asegúrate de que está corriendo."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome & Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-950 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent sm:text-4xl">
          Sistema de Restaurante
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
          Monitorea y administra el inventario de platos, el estado de las mesas y los pedidos en tiempo real.
        </p>
      </div>

      {/* Connection Error Message */}
      {error && (
        <div className="p-5 border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 rounded-2xl flex gap-4 items-start shadow-sm animate-shake">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-amber-900 dark:text-amber-200">Error de conexión con el Backend</h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Platos */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Total Platos</p>
              <h3 className="text-3xl font-extrabold mt-2 tracking-tight text-slate-800 dark:text-white">
                {loading ? "..." : stats.platosCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Menú del restaurante</span>
            <Link href="/platos" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1">
              Ver platos &rarr;
            </Link>
          </div>
        </div>

        {/* Total Mesas */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Total Mesas</p>
              <h3 className="text-3xl font-extrabold mt-2 tracking-tight text-slate-800 dark:text-white">
                {loading ? "..." : stats.mesasCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Distribución de sala</span>
            <Link href="/mesas" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1">
              Ver mesas &rarr;
            </Link>
          </div>
        </div>

        {/* Pedidos del Día */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Pedidos Activos</p>
              <h3 className="text-3xl font-extrabold mt-2 tracking-tight text-slate-800 dark:text-white">
                {loading ? "..." : stats.pedidosPendientes}
                <span className="text-sm text-slate-400 font-normal ml-2">
                  (de {stats.pedidosCount} totales)
                </span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Comandas en cocina y caja</span>
            <Link href="/pedidos" className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1">
              Ver pedidos &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Secciones de Gestión</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/platos"
            className="group flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 p-6 rounded-2xl hover:shadow-md transition-all duration-300"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                🍳
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Gestión de Platos
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Visualiza el listado del menú, el estado de disponibilidad y añade nuevos platos culinarios.
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
              Ir a Platos
              <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </Link>

          <Link
            href="/mesas"
            className="group flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 p-6 rounded-2xl hover:shadow-md transition-all duration-300"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                🪑
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Estado de Mesas
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Controla el aforo del restaurante y cambia el estado (disponible, reservada, ocupada) en tiempo real.
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Ir a Mesas
              <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </Link>

          <Link
            href="/pedidos"
            className="group flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 p-6 rounded-2xl hover:shadow-md transition-all duration-300"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                📝
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Pedidos Activos
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Genera comandas vinculadas a mesas con selección múltiple de platos y actualiza su progreso.
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-bold text-amber-600 dark:text-amber-400">
              Ir a Pedidos
              <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
