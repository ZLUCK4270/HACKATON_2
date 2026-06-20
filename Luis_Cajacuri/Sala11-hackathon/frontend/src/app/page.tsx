"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchGrowthRanking,
  fetchMostSuccessfulVideo,
  fetchFormatComparison,
  GrowthRankingItem,
  SuccessfulVideoItem,
  FormatComparisonData,
} from "@/services/analytics";
import KpiCard from "@/components/ui/KpiCard";
import FormatComparisonCard from "@/components/ui/FormatComparisonCard";
import GrowthRanking from "@/components/ui/GrowthRanking";
import MostSuccessfulVideo from "@/components/ui/MostSuccessfulVideo";

type NetworkType = "youtube" | "tiktok" | "instagram" | "facebook";

export default function Home() {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>("youtube");
  const [ranking, setRanking] = useState<GrowthRankingItem[]>([]);
  const [mostSuccessful, setMostSuccessful] = useState<SuccessfulVideoItem | null>(null);
  const [formatComp, setFormatComp] = useState<FormatComparisonData | null>(null);
  const [umbral, setUmbral] = useState<number>(0.5);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedNetwork !== "youtube") {
      setIsLoading(false);
      return;
    }

    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [rankingData, videosData, formatData] = await Promise.all([
          fetchGrowthRanking("youtube"),
          fetchMostSuccessfulVideo("youtube"),
          fetchFormatComparison("youtube"),
        ]);
        setRanking(rankingData);
        setMostSuccessful(videosData[0] || null);
        setFormatComp(formatData);
      } catch (err: any) {
        setError(err.message || "Error al conectar con la base de datos.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedNetwork]);

  const handleNetworkChange = (network: NetworkType) => {
    setSelectedNetwork(network);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="border-b border-slate-200 pb-4 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Dashboard Principal
          </h2>
          <p className="text-xs text-slate-500">Consolidado analítico y respuestas clave del negocio</p>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-xs">
          {(["youtube", "tiktok", "instagram", "facebook"] as NetworkType[]).map((net) => (
            <button
              key={net}
              onClick={() => handleNetworkChange(net)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                selectedNetwork === net
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {net}
            </button>
          ))}
        </div>
      </header>

      {selectedNetwork !== "youtube" ? (
        <section className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 text-lg font-bold font-mono">
            {selectedNetwork.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">Próximamente</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              La integración con la API de {selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)} está planificada para el Día 3. Actualmente, puedes ver las analíticas en el módulo de YouTube.
            </p>
          </div>
          <button
            onClick={() => setSelectedNetwork("youtube")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Ir a YouTube
          </button>
        </section>
      ) : isLoading ? (
        <div className="py-20 text-center text-xs text-slate-500 font-semibold">
          Cargando métricas consolidadas del negocio...
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">
          {error}
        </div>
      ) : ranking.length === 0 ? (
        <section className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
          <h3 className="font-bold text-slate-800 text-base">No hay canales ingresados</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Aún no has analizado ningún canal de YouTube. Ve al módulo lateral de YouTube para ingresar canales y generar los primeros snapshots.
          </p>
          <Link
            href="/youtube"
            className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all"
          >
            Agregar Canal de YouTube
          </Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header del Ranking con Configuración de Umbral */}
            <div className="flex items-center justify-between mb-2 mt-4 px-2">
              <span className="text-sm font-bold text-slate-800">Ranking General</span>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-600">Umbral Estancamiento:</span>
                <input
                  type="number"
                  step="0.1"
                  value={umbral}
                  onChange={(e) => setUmbral(parseFloat(e.target.value) || 0)}
                  className="w-16 text-xs text-right bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500 font-bold"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
            </div>

            {/* Ranking */}
            <GrowthRanking ranking={ranking} umbral={umbral} />

            {/* Comparación de Formatos */}
            {formatComp && <FormatComparisonCard formatComp={formatComp} />}
          </div>

          {/* Columna Derecha */}
          <div className="space-y-6">
            
            {/* KPI Cards de Resumen */}
            <div className="grid grid-cols-2 gap-3">
              <KpiCard
                title="Canales"
                value={ranking.length}
                size="sm"
                icon={<div className="h-7 w-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs">YT</div>}
              />
              <KpiCard
                title="Videos"
                value={ranking.reduce((acc, curr) => acc + curr.videoCount, 0).toLocaleString()}
                size="sm"
                icon={<div className="h-7 w-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-xs">VD</div>}
              />
            </div>

            {/* Video más exitoso */}
            <MostSuccessfulVideo mostSuccessful={mostSuccessful} />

          </div>
        </div>
      )}
    </div>
  );
}
