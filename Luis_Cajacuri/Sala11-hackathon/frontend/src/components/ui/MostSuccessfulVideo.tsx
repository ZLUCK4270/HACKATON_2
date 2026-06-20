import React from "react";
import { SuccessfulVideoItem } from "@/services/analytics";
import Tooltip from "./Tooltip";

interface MostSuccessfulVideoProps {
  mostSuccessful: SuccessfulVideoItem | null;
}

export default function MostSuccessfulVideo({ mostSuccessful }: MostSuccessfulVideoProps) {
  if (!mostSuccessful) return null;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div>
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold text-slate-800 text-base">Video Más Exitoso</h3>
          <Tooltip 
            content={
              <span>
                Métrica de éxito:
                <br />
                1. Mayor número de interacciones (likes + comentarios).
                <br />
                2. En caso de empate, decide la mayor tasa de engagement.
              </span>
            }
          />
        </div>
        <p className="text-xs text-slate-600">Mayor interacción (likes + comentarios)</p>
      </div>

      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-150 space-y-3">
        <div>
          <span className="text-xs font-semibold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
            {mostSuccessful.channelName}
          </span>
          <h4 className="text-sm font-bold text-slate-800 mt-2 line-clamp-2 leading-relaxed">
            {mostSuccessful.title}
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-white p-2 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block">Interacciones</span>
            <span className="text-sm font-bold text-slate-700 mt-0.5 block">
              {mostSuccessful.interacciones.toLocaleString()}
            </span>
          </div>

          <div className="bg-white p-2 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block">Engagement</span>
            <span className="text-sm font-bold text-indigo-600 mt-0.5 block">
              {mostSuccessful.engagement}%
            </span>
          </div>
        </div>

        <div className="flex justify-between text-xs text-slate-600 pt-1 font-bold">
          <span>Vistas: {mostSuccessful.views.toLocaleString()}</span>
          <span>{mostSuccessful.publishedDate}</span>
        </div>
      </div>
    </div>
  );
}
