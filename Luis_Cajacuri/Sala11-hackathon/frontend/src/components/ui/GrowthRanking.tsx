import React from "react";
import { GrowthRankingItem } from "@/services/analytics";
import Tooltip from "./Tooltip";

interface GrowthRankingProps {
  ranking: GrowthRankingItem[];
  umbral?: number;
}

export default function GrowthRanking({ ranking, umbral = 0.5 }: GrowthRankingProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div>
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold text-slate-800 text-base">Canales que crecen más rápido</h3>
          <Tooltip 
            content={
              <span>
                Fórmula: <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">((Final - Inicio) / Inicio) × 100</code>.
                <br />
                Mide la velocidad de crecimiento en porcentaje relativo al tamaño inicial.
              </span>
            }
          />
        </div>
        <p className="text-xs text-slate-600">Ordenado por tasa de crecimiento porcentual %</p>
      </div>

      <div className="divide-y divide-slate-100 pt-1">
        {ranking.map((item, index) => (
          <div key={item.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-semibold text-slate-500 w-4 shrink-0">#{index + 1}</span>
              {item.customImageUrl ? (
                <img
                  src={item.customImageUrl}
                  alt={item.name}
                  className="h-8 w-8 rounded-full border border-slate-200 object-cover shrink-0"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                  {item.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-slate-800 truncate">
                  {item.name}
                </h4>
                <span className="text-xs text-slate-600 font-medium block mt-0.5">
                  {item.snapshotsCount} {item.snapshotsCount === 1 ? 'día registrado' : 'días registrados'}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              {item.snapshotsCount < 2 ? (
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                  Solo 1 día — vuelve mañana
                </span>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  {item.tasaCrecimiento <= umbral && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase tracking-wider mb-0.5">
                      Estancado
                    </span>
                  )}
                  <span className={`text-sm font-bold ${
                    item.tasaCrecimiento <= umbral ? "text-red-600" : item.tasaCrecimiento >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {item.tasaCrecimiento >= 0 ? "+" : ""}{item.tasaCrecimiento}%
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    {item.crecimientoNeto >= 0 ? "+" : ""}{item.crecimientoNeto.toLocaleString()} subs
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
