import React from "react";
import Tooltip from "./Tooltip";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  valueClassName?: string;
  size?: "sm" | "md";
  tooltip?: React.ReactNode;
}

export default function KpiCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  valueClassName = "text-slate-900",
  size = "md",
  tooltip
}: KpiCardProps) {
  const isSmall = size === "sm";

  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between h-full ${isSmall ? 'p-3' : 'p-4'}`}>
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-1">
          <span className={`text-slate-500 font-bold uppercase tracking-wider ${isSmall ? 'text-xs' : 'text-xs'}`}>{title}</span>
          {tooltip && <Tooltip content={tooltip} />}
        </div>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div>
        <div className={`font-bold mt-1 ${isSmall ? 'text-lg' : 'text-xl'} ${valueClassName}`}>{value}</div>
        {subtitle && <div className="text-xs text-slate-600 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}

