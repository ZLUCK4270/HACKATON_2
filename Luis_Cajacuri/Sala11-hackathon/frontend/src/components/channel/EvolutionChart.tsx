"use client";

import { useState } from "react";
import { HistoryItem } from "@/services/analytics";

interface EvolutionChartProps {
  history: HistoryItem[];
}

type MetricType = "subscriberCount" | "totalViews" | "engagementPromedio";

export default function EvolutionChart({ history }: EvolutionChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>("subscriberCount");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!history || history.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center text-sm font-medium text-slate-600 py-12">
        No hay datos históricos para graficar. Realiza capturas en diferentes días para ver la evolución.
      </div>
    );
  }

  // Si solo hay 1 snapshot, duplicamos el punto para dibujar una línea horizontal básica
  const chartData = history.length === 1 ? [history[0], history[0]] : history;

  // Obtener los valores de la métrica activa
  const values = chartData.map((d) => d[activeMetric] || 0) as number[];
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  // Dimensiones del SVG
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 20;

  // Calcular las coordenadas X e Y para cada punto
  const points = chartData.map((item, index) => {
    const x = paddingX + (index / (chartData.length - 1)) * (width - 2 * paddingX);
    const val = (item[activeMetric] || 0) as number;
    const y = height - paddingY - ((val - minVal) / range) * (height - 2 * paddingY);
    return { x, y, item, val };
  });

  // Generar el path string para la línea
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Generar el path string para el relleno gradiente inferior
  const fillD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  // Formatear números
  const formatValue = (val: number) => {
    if (activeMetric === "engagementPromedio") return `${val.toFixed(2)}%`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toLocaleString();
  };

  const getMetricLabel = (m: MetricType) => {
    if (m === "subscriberCount") return "Suscriptores";
    if (m === "totalViews") return "Vistas Totales";
    return "Engagement Promedio";
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Historial de Evolución</h3>
          <p className="text-xs text-slate-600 font-semibold">Evolución métrica capturada a través de snapshots diarios</p>
        </div>
        
        {/* Selector de Métrica */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
          {(["subscriberCount", "totalViews", "engagementPromedio"] as MetricType[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setActiveMetric(m);
                setHoveredIndex(null);
              }}
              className={`px-3 py-1 text-xs font-extrabold rounded-md transition-all cursor-pointer ${
                activeMetric === m
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {getMetricLabel(m).split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas de la gráfica */}
      <div className="relative pt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Líneas horizontales de guía (Grid) */}
          {[0, 0.5, 1].map((ratio, i) => {
            const y = paddingY + ratio * (height - 2 * paddingY);
            const val = maxVal - ratio * (maxVal - minVal);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  fill="#475569"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  {formatValue(val)}
                </text>
              </g>
            );
          })}

          {/* Relleno del área gradiente */}
          <path d={fillD} fill="url(#gradientArea)" />

          {/* Línea principal del gráfico */}
          <path
            d={pathD}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Puntos de interacción */}
          {points.map((p, i) => (
            <g
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* Círculo invisible más grande para facilitar el hover */}
              <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
              
              {/* Punto real */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === i ? "6" : "4"}
                fill={hoveredIndex === i ? "#4f46e5" : "#ffffff"}
                stroke="#4f46e5"
                strokeWidth={hoveredIndex === i ? "2" : "2"}
                className="transition-all duration-150"
              />
            </g>
          ))}
        </svg>

        {/* Tooltip flotante en HTML puro controlado por hover index */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-md pointer-events-none transition-all flex flex-col space-y-0.5 border border-slate-800"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100 - 30}%`,
              transform: "translateX(-50%)",
            }}
          >
            <span className="text-slate-400 font-medium">
              {new Date(points[hoveredIndex].item.date).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
              })}
            </span>
            <span className="text-indigo-300 font-black">
              {getMetricLabel(activeMetric)}: {formatValue(points[hoveredIndex].val)}
            </span>
          </div>
        )}
      </div>

      {/* Etiquetas del eje X (Fechas) */}
      <div className="flex justify-between text-xs font-bold text-slate-600 px-10">
        <span>
          {new Date(chartData[0].date).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          })}
        </span>
        {chartData.length > 2 && (
          <span>
            {new Date(chartData[Math.floor(chartData.length / 2)].date).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}
        <span>
          {new Date(chartData[chartData.length - 1].date).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
    </div>
  );
}
