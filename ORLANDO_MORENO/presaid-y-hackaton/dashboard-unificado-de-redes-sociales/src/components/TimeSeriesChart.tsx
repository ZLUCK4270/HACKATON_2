import React from "react";
import { Channel, Snapshot } from "../types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart, Bar } from "recharts";
import { Calendar, HelpCircle, FileText } from "lucide-react";

interface TimeSeriesChartProps {
  channels: Channel[];
  snapshots: Snapshot[];
}

export default function TimeSeriesChart({ channels, snapshots }: TimeSeriesChartProps) {
  // We need to format data for standard Recharts coordinate format:
  // Array of { date: "YYYY-MM-DD", [channelTitle1]: subs1, [channelTitle2]: subs2 }
  
  // 1. Gather all unique dates
  const uniqueDates = Array.from(new Set(snapshots.map((s) => s.date))).sort();
  
  // 2. Map dates to dataset
  const chartData = uniqueDates.map((date) => {
    const datum: { [key: string]: any } = { date };
    channels.forEach((chan) => {
      // Find snapshot for this channel and date
      const snap = snapshots.find((s) => s.channelId === chan.id && s.date === date);
      if (snap) {
        datum[chan.customName] = snap.subscribers;
      } else {
        // If snapshot is missing, we perform linear interpolation!
        // This is the implementation of our response to Stop 4! It prevents drops to zero.
        datum[chan.customName] = interpolateMissingValue(chan.id, date, snapshots);
      }
    });
    return datum;
  });

  // Helper to interpolate missing values
  function interpolateMissingValue(channelId: string, targetDateStr: string, allSnaps: Snapshot[]): number | null {
    const channelSnaps = allSnaps
      .filter((s) => s.channelId === channelId)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (channelSnaps.length === 0) return null;

    const targetTime = new Date(targetDateStr).getTime();

    // Find the closest snap before and closest snap after
    let before: Snapshot | null = null;
    let after: Snapshot | null = null;

    for (const snap of channelSnaps) {
      const snapTime = new Date(snap.date).getTime();
      if (snapTime < targetTime) {
        before = snap;
      } else if (snapTime > targetTime && !after) {
        after = snap;
        break;
      }
    }

    if (before && after) {
      const beforeTime = new Date(before.date).getTime();
      const afterTime = new Date(after.date).getTime();
      const fraction = (targetTime - beforeTime) / (afterTime - beforeTime);
      return Math.round(before.subscribers + fraction * (after.subscribers - before.subscribers));
    }

    // fallback if we have only one sided reference
    if (before) return before.subscribers;
    if (after) return after.subscribers;

    return null;
  }

  // Pre-selected colors for channels
  const lineColors = ["#0ea5e9", "#10b981", "#8b5cf6", "#f43f5e", "#f59e0b"];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-base font-sans font-black text-slate-800 flex items-center gap-2">
            <Calendar size={18} className="text-sky-500" />
            Evolución Histórica de la Comunidad (Suscriptores)
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Serie temporal acumulada de snapshots recopilados de forma autónoma.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg text-[9px] font-mono leading-tight border border-sky-150 max-w-xs md:max-w-md">
          <span>💡</span>
          <span>
            <b>Atención de Datos:</b> Los días sin registros se resuelven mediante <b>interpolación lineal</b> para evitar caídas a cero y mantener la serie suavizada.
          </span>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                dy={8}
                fontFamily="Fira Code, monospace"
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => val.toLocaleString()}
                dx={-8}
                fontFamily="Fira Code, monospace"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#0f172a", 
                  borderRadius: "12px", 
                  color: "#fff",
                  border: "none",
                  fontSize: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}
                labelStyle={{ fontWeight: "bold", color: "#38bdf8", marginBottom: "4px", fontFamily: "monospace" }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
              />
              {channels.map((chan, idx) => (
                <Line
                  key={chan.id}
                  type="monotone"
                  dataKey={chan.customName}
                  stroke={lineColors[idx % lineColors.length]}
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ r: 3, strokeWidth: 1 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
          <p className="text-sm text-slate-400 font-mono italic">No hay suficientes snapshots cargados para dibujar la serie temporal.</p>
        </div>
      )}
    </div>
  );
}
