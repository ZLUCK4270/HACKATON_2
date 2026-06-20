"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChannelHeader from "@/components/channel/ChannelHeader";
import Kpis from "@/components/channel/Kpis";
import VideoList from "@/components/channel/VideoList";
import EvolutionChart from "@/components/channel/EvolutionChart";
import { ChannelDetail } from "@/types/youtube";
import { fetchChannelDetail } from "@/services/api";
import { fetchChannelHistory, HistoryItem } from "@/services/analytics";

export default function ChannelDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [channel, setChannel] = useState<ChannelDetail | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [channelData, historyData] = await Promise.all([
          fetchChannelDetail(id),
          fetchChannelHistory(id),
        ]);
        setChannel(channelData);
        setHistory(historyData);
      } catch (err: any) {
        setError(err.message || "Error de conexión.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs text-slate-600 font-semibold">
        Cargando análisis de canal...
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="text-red-500 text-sm font-bold">Error: {error || "No se encontró el canal"}</div>
      </div>
    );
  }

  // Cálculo de Crecimiento
  let crecimientoNeto = 0;
  let tasaCrecimiento = 0;
  if (history.length >= 2) {
    const anterior = history[0].subscriberCount;
    const actual = history[history.length - 1].subscriberCount;
    crecimientoNeto = actual - anterior;
    tasaCrecimiento = anterior > 0 ? (crecimientoNeto / anterior) * 100 : 0;
  }

  return (
    <div className="space-y-6">
      {/* Header Modulado */}
      <ChannelHeader 
        name={channel.name} 
        id={channel.id} 
        fetchedDate={channel.fetchedDate} 
        customImageUrl={channel.customImageUrl}
      />

      {/* KPIs Grid Modulado */}
      <Kpis 
        subscriberCount={channel.subscriberCount}
        totalViews={channel.totalViews}
        videoCount={channel.videoCount}
        engagementPromedio={channel.engagementPromedio}
      />

      {/* Gráfico y Crecimiento (2/3 y 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Gráfico de Evolución Histórica */}
          <EvolutionChart history={history} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-full flex flex-col justify-center">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Crecimiento Histórico</h3>
            {history.length >= 2 ? (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Nuevos Suscriptores</p>
                  <p className={`text-3xl font-bold ${crecimientoNeto >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {crecimientoNeto > 0 ? '+' : ''}{new Intl.NumberFormat('en-US').format(crecimientoNeto)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Tasa de Crecimiento</p>
                  <p className={`text-3xl font-bold ${tasaCrecimiento >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tasaCrecimiento > 0 ? '+' : ''}{tasaCrecimiento.toFixed(2)}%
                  </p>
                </div>
                <div className="text-xs text-slate-500 mt-4 font-medium">
                  * Comparado desde el primer registro ({new Date(history[0].date).toLocaleDateString()})
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-600 font-medium text-center">
                Se necesitan al menos 2 registros históricos para calcular el crecimiento.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Listado y Filtros de Videos Modulados */}
      <VideoList videos={channel.videos} />
    </div>
  );
}
