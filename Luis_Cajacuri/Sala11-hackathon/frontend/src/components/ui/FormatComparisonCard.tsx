import React from "react";
import { FormatComparisonData } from "@/services/analytics";
import Tooltip from "./Tooltip";

interface FormatComparisonCardProps {
  formatComp: FormatComparisonData;
}

export default function FormatComparisonCard({ formatComp }: FormatComparisonCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
      <div>
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold text-slate-800 text-base">¿Qué formato genera más interacción?</h3>
          <Tooltip 
            content={
              <span>
                Inferencia de formato:
                <br />
                • <strong>Shorts</strong>: Videos de 60 segundos o menos.
                <br />
                • <strong>Largos</strong>: Videos de más de 60 segundos.
              </span>
            }
          />
        </div>
        <p className="text-xs text-slate-600">Comparativa de rendimiento entre videos cortos (Shorts) y videos largos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Card Shorts */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-700">Shorts (≤ 60s)</span>
            <span className="px-2 py-0.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-md">
              {formatComp.shorts.count} videos
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Interacciones Promedio:</span>
              <span className="text-slate-800 font-semibold">{formatComp.shorts.promedioInteracciones}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Vistas Promedio:</span>
              <span className="text-slate-800 font-semibold">{formatComp.shorts.promedioVistas.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Engagement Promedio:</span>
              <span className="text-indigo-600 font-semibold">{formatComp.shorts.promedioEngagement}%</span>
            </div>
          </div>
        </div>

        {/* Card Videos Largos */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-700">Videos Largos (&gt; 60s)</span>
            <span className="px-2 py-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-md">
              {formatComp.longs.count} videos
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Interacciones Promedio:</span>
              <span className="text-slate-800 font-semibold">{formatComp.longs.promedioInteracciones}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Vistas Promedio:</span>
              <span className="text-slate-800 font-semibold">{formatComp.longs.promedioVistas.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Engagement Promedio:</span>
              <span className="text-emerald-600 font-semibold">{formatComp.longs.promedioEngagement}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-indigo-700 text-xs font-semibold">
        💡 {formatComp.conclusion}
      </div>
    </div>
  );
}
