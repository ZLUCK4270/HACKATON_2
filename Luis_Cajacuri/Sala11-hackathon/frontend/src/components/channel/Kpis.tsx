import KpiCard from "../ui/KpiCard";

interface KpisProps {
  subscriberCount: number;
  totalViews: number;
  videoCount: number;
  engagementPromedio: number | null;
}

export default function Kpis({ subscriberCount, totalViews, videoCount, engagementPromedio }: KpisProps) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KpiCard 
        title="Suscriptores" 
        value={subscriberCount.toLocaleString()} 
      />
      <KpiCard 
        title="Vistas Totales" 
        value={totalViews.toLocaleString()} 
      />
      <KpiCard 
        title="Videos Totales" 
        value={videoCount} 
      />
      <KpiCard 
        title="Engagement Promedio" 
        value={engagementPromedio !== null ? `${engagementPromedio}%` : "Sin datos"} 
        valueClassName="text-emerald-700"
        tooltip={
          <span>
            Fórmula: <code>Promedio del engagement de los videos.</code>
            <br />
            Mide qué tan conectados están los usuarios con el canal en el periodo.
          </span>
        }
      />
    </section>
  );
}
