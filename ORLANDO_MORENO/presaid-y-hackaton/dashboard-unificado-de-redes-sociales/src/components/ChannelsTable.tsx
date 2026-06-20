import React, { useState } from "react";
import { Channel, Snapshot, Video, BusinessMetrics } from "../types";
import { Trash2, AlertOctagon, TrendingUp, TrendingDown, ArrowRight, PlusCircle, HelpCircle, UserPlus, Eye, Youtube, Sparkles } from "lucide-react";
import { calculateChannelAverageEngagement } from "../utils";
import { motion, AnimatePresence } from "motion/react";

interface ChannelsTableProps {
  channels: Channel[];
  snapshots: Snapshot[];
  videos: Video[];
  metrics: BusinessMetrics;
  onAddChannel: (id: string, name: string) => Promise<void>;
  onDeleteChannel: (id: string) => Promise<void>;
}

export default function ChannelsTable({
  channels,
  snapshots,
  videos,
  metrics,
  onAddChannel,
  onDeleteChannel
}: ChannelsTableProps) {
  const [newChannelId, setNewChannelId] = useState<string>("");
  const [newChannelName, setNewChannelName] = useState<string>("");
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAddSubmit = async (e: React.FormEvent, directId?: string, directName?: string) => {
    if (e) e.preventDefault();
    const idToUse = directId || newChannelId;
    const nameToUse = directName || newChannelName;
    
    if (!idToUse.trim()) return;

    setIsAdding(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await onAddChannel(idToUse.trim(), nameToUse.trim());
      setSuccessMsg(`¡Canal "${nameToUse || idToUse}" registrado con éxito!`);
      setNewChannelId("");
      setNewChannelName("");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (e: any) {
      setErrorMsg(e.message || "Error al registrar el canal.");
    } finally {
      setIsAdding(false);
    }
  };

  const suggestions = [
    { label: "Hablando Huevadas", value: "@HablandoHuevadasOficial", alias: "Hablando Huevadas" },
    { label: "MrBeast", value: "@MrBeast", alias: "MrBeast" },
    { label: "Luisito Comunica", value: "@luisito-comunica", alias: "Luisito Comunica" },
    { label: "Ibai Llanos", value: "@IbaiLlanos", alias: "Ibai Llanos" }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
      {/* Header and Add form */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-base font-sans font-black text-slate-800 flex items-center gap-2">
              <Youtube size={20} className="text-red-500" />
              Consolidado General de Canales Monitoreados
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Métricas clave, tasas calculadas y estado de estancamiento del periodo.
            </p>
          </div>

          {/* Add Channel Inline Form */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <form onSubmit={(e) => handleAddSubmit(e)} className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ID / Url / @Handle (e.g. @MrBeast)"
                  value={newChannelId}
                  onChange={(e) => setNewChannelId(e.target.value)}
                  disabled={isAdding}
                  className="bg-white text-xs border border-slate-200 pl-3 pr-8 py-2 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 font-mono w-56 shadow-sm transition-all"
                  required
                />
                <span className="absolute right-2.5 top-2.5 text-slate-350 cursor-help" title="Soporta Handles completos (ej. @HablandoHuevadasOficial), URLs de canales o códigos UC directos de YouTube.">
                  <HelpCircle size={14} />
                </span>
              </div>
              <input
                type="text"
                placeholder="Alias / Nombre"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                disabled={isAdding}
                className="bg-white text-xs border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 w-36 shadow-sm transition-all"
              />
              <button
                type="submit"
                disabled={isAdding}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 border border-red-700 hover:bg-red-500 active:bg-red-700 text-white rounded-xl text-xs font-sans font-bold transition-all shadow-sm shadow-red-600/10 disabled:opacity-50 cursor-pointer"
              >
                <UserPlus size={14} />
                {isAdding ? "Registrando..." : "Agregar Canal"}
              </button>
            </form>

            {/* Sugeridos Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1 justify-end">
              <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1 mr-1">
                <Sparkles size={11} className="text-amber-500" />
                Sugeridos rápidos:
              </span>
              {suggestions.map((sug) => (
                <button
                  key={sug.value}
                  type="button"
                  disabled={isAdding}
                  onClick={() => {
                    setNewChannelId(sug.value);
                    setNewChannelName(sug.alias);
                  }}
                  className="text-[9px] font-medium bg-slate-100 hover:bg-slate-200/90 text-slate-650 px-2 py-1 rounded-md transition-colors cursor-pointer"
                >
                  {sug.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-6 mt-4 p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs flex gap-2 items-center font-mono shadow-sm"
          >
            <AlertOctagon size={15} className="shrink-0 text-rose-500" />
            <span><b>Atención:</b> {errorMsg}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-6 mt-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs flex gap-2 items-center font-sans shadow-sm"
          >
            <Sparkles size={15} className="shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table presentation */}
      <div className="overflow-x-auto">
        <table id="channels-table" className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/20 font-mono text-[10px] uppercase text-slate-450 tracking-wider">
              <th className="py-4 px-6 font-semibold">Canal</th>
              <th className="py-4 px-4 font-semibold text-right">Suscriptores Hoy</th>
              <th className="py-4 px-4 font-semibold text-right">Vistas Totales</th>
              <th className="py-4 px-4 font-semibold text-right">Crecimiento Neto</th>
              <th className="py-4 px-4 font-semibold text-right">Tasa Crecimiento</th>
              <th className="py-4 px-4 font-semibold text-center">Tendencia</th>
              <th className="py-4 px-4 font-semibold text-right">Engagement Prom.</th>
              <th className="py-4 px-4 font-semibold text-center">Estado Alerta</th>
              <th className="py-4 px-6 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {channels.map((channel) => {
              // Extract calculated stats of channel
              const chanSnaps = snapshots
                .filter((s) => s.channelId === channel.id)
                .sort((a, b) => a.date.localeCompare(b.date));

              const lastSnap = chanSnaps.length > 0 ? chanSnaps[chanSnaps.length - 1] : null;
              const firstSnap = chanSnaps.length > 0 ? chanSnaps[0] : null;

              const subsFin = lastSnap ? lastSnap.subscribers : 0;
              const viewsFin = lastSnap ? lastSnap.totalViews : 0;
              
              const netGrowth = lastSnap && firstSnap ? lastSnap.subscribers - firstSnap.subscribers : 0;
              const startSubs = firstSnap ? firstSnap.subscribers : 0;
              const growthRate = startSubs > 0 ? (netGrowth / startSubs) * 100 : 0;

              const trend = metrics.trends.find((t) => t.channel.id === channel.id);
              const stagnation = metrics.stagnationList.find((s) => s.channel.id === channel.id);
              const avgEngagement = calculateChannelAverageEngagement(channel.id, videos);

              const avatarUrl = channel.snippet?.thumbnails?.default?.url || 
                "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&h=100&fit=crop";

              return (
                <tr key={channel.id} className="hover:bg-slate-50/70 transition-colors font-sans text-sm text-slate-600">
                  {/* Channel block */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarUrl}
                        alt={channel.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                      />
                      <div>
                        <span className="font-extrabold text-slate-800 font-sans block leading-tight">
                          {channel.customName}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono font-medium block mt-0.5 max-w-[140px] truncate" title={channel.id}>
                          {channel.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Subscribers count */}
                  <td className="py-4 px-4 text-right font-mono font-bold text-slate-800">
                    {subsFin.toLocaleString()}
                  </td>

                  {/* Views count */}
                  <td className="py-4 px-4 text-right font-mono text-slate-500">
                    {viewsFin.toLocaleString()}
                  </td>

                  {/* Net Growth */}
                  <td className={`py-4 px-4 text-right font-mono font-bold ${netGrowth > 0 ? "text-emerald-600" : netGrowth < 0 ? "text-rose-500" : "text-slate-400"}`}>
                    {netGrowth > 0 ? `+${netGrowth.toLocaleString()}` : netGrowth.toLocaleString()}
                  </td>

                  {/* Growth Rate */}
                  <td className={`py-4 px-4 text-right font-mono font-black ${growthRate > 0 ? "text-emerald-600" : growthRate < 0 ? "text-rose-500" : "text-slate-400"}`}>
                    {growthRate > 0 ? `+${growthRate.toFixed(2)}%` : `${growthRate.toFixed(2)}%`}
                  </td>

                  {/* Trend indicator */}
                  <td className="py-4 px-4 text-center">
                    {trend ? (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        trend.trendType === "Creciente" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : 
                        trend.trendType === "Decreciente" ? "bg-rose-50 text-rose-700 border border-rose-100" : 
                        "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {trend.trendType === "Creciente" && <TrendingUp size={10} />}
                        {trend.trendType === "Decreciente" && <TrendingDown size={10} />}
                        {trend.trendType}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300 font-mono">-</span>
                    )}
                  </td>

                  {/* Average engagement */}
                  <td className="py-4 px-4 text-right font-mono font-bold text-slate-800">
                    {avgEngagement.toFixed(2)}%
                  </td>

                  {/* Stagnant status indicator */}
                  <td className="py-4 px-4 text-center">
                    {stagnation ? (
                      stagnation.isStagnant ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg animate-pulse" title={`Tasa de crecimiento (${growthRate.toFixed(3)}%) menor o igual al umbral (${metrics.stagnationList[0]?.threshold}%)`}>
                          ⚠️ Estancado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                          ✅ Saludable
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-slate-300 font-mono">-</span>
                    )}
                  </td>

                  {/* Delete action */}
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => onDeleteChannel(channel.id)}
                      disabled={channels.length <= 1}
                      className="p-1.5 text-slate-450 hover:text-rose-600 rounded-lg transition-colors disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                      title={channels.length <= 1 ? "Debe conservar al menos un canal para no romper el dashboard" : "Eliminar de la supervisión"}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
