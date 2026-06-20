"use client";

import { useEffect, useState } from "react";
import { Plus, X, Users, Zap, CheckCircle, Circle, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { useNotification } from "@/components/Notification";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SkeletonCard } from "@/components/LoadingSpinner";

interface Mesa { id: number; numero: number; capacidad: number; estado: string; }

const estadoConfig: Record<string, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  disponible: { label: "Disponible", color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)",  Icon: CheckCircle },
  ocupada:    { label: "Ocupada",    color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",   Icon: Circle },
  reservada:  { label: "Reservada",  color: "#eab308", bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.3)",   Icon: Clock },
};

const inputStyle: React.CSSProperties = {
  background: "var(--bg-input)", border: "1px solid var(--border)",
  color: "var(--text-primary)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", fontSize: "0.9rem", width: "100%",
  outline: "none", fontFamily: "inherit",
};
const btnPrimary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "6px",
  padding: "10px 20px", borderRadius: "8px",
  background: "linear-gradient(135deg, #f59e0b, #d97706)",
  border: "none", color: "#fff", fontWeight: 600, fontSize: "0.875rem",
  cursor: "pointer", boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
};
const btnGhost: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "6px",
  padding: "10px 20px", borderRadius: "8px",
  background: "transparent", border: "1px solid var(--border)",
  color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer",
};

export default function MesasPage() {
  const [mesas, setMesas]       = useState<Mesa[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [numero, setNumero]     = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [stateChange, setStateChange] = useState<{ id: number; newState: string } | null>(null);
  const { notify } = useNotification();

  const fetchMesas = async () => {
    try {
      setLoading(true);
      const data = await api<Mesa[]>("/mesas");
      setMesas(data); setError(false);
    } catch { setError(true); notify("Error al cargar mesas", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMesas(); }, []);

  const crearMesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero || !capacidad) { notify("Por favor completa todos los campos", "error"); return; }
    try {
      await api("/mesas", { method: "POST", body: { numero: parseInt(numero), capacidad: parseInt(capacidad) } });
      notify("Mesa creada correctamente", "success");
      setNumero(""); setCapacidad(""); setShowForm(false); fetchMesas();
    } catch { notify("Error al crear mesa", "error"); }
  };

  const cambiarEstado = async () => {
    if (!stateChange) return;
    try {
      await api(`/mesas/${stateChange.id}/estado`, { method: "PATCH", body: { estado: stateChange.newState } });
      notify(`Mesa → ${stateChange.newState}`, "success");
      setStateChange(null); fetchMesas();
    } catch { notify("Error al cambiar estado", "error"); }
  };

  if (error) return (
    <div style={{ textAlign: "center", padding: "5rem 0" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}><Zap size={48} color="#ef4444" /></div>
      <h1 style={{ color: "#ef4444", margin: "0 0 0.5rem" }}>Error de conexión</h1>
      <p style={{ color: "var(--text-secondary)", margin: 0 }}>No se pudo conectar con el backend</p>
    </div>
  );

  const disponibles = mesas.filter(m => m.estado === "disponible").length;
  const ocupadas    = mesas.filter(m => m.estado === "ocupada").length;
  const reservadas  = mesas.filter(m => m.estado === "reservada").length;

  return (
    <div className="animate-fade-in">
      {/* Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--green)" }}>Plano del local</p>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Mesas</h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {mesas.length} mesas · {disponibles} disponibles · {ocupadas} ocupadas · {reservadas} reservadas
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={showForm ? btnGhost : btnPrimary}>
          {showForm ? <><X size={15} /> Cancelar</> : <><Plus size={15} /> Nueva Mesa</>}
        </button>
      </div>

      {/* Resumen */}
      {!loading && mesas.length > 0 && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {Object.entries(estadoConfig).map(([key, cfg]) => {
            const count = mesas.filter(m => m.estado === key).length;
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "99px", background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: "0.82rem", fontWeight: 600, color: cfg.color }}>
                <cfg.Icon size={13} /> {cfg.label}: <strong>{count}</strong>
              </div>
            );
          })}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="animate-slide-down" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus size={16} color="var(--gold)" /> Nueva Mesa
          </h3>
          <form onSubmit={crearMesa}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", alignItems: "end" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Número de mesa</label>
                <input type="number" placeholder="Ej: 5" value={numero} onChange={(e) => setNumero(e.target.value)} required min="1" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Capacidad (personas)</label>
                <input type="number" placeholder="Ej: 4" value={capacidad} onChange={(e) => setCapacidad(e.target.value)} required min="1" style={inputStyle} />
              </div>
              <button type="submit" style={{ ...btnPrimary, height: "42px" }}>Crear</button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de mesas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
        {loading
          ? [1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)
          : mesas.length === 0
          ? <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>No hay mesas registradas</div>
          : mesas.map((mesa) => {
              const cfg = estadoConfig[mesa.estado] ?? estadoConfig["disponible"];
              return (
                <div key={mesa.id} className="animate-fade-in" style={{ background: "var(--bg-card)", border: `1px solid ${cfg.border}`, borderRadius: "var(--radius-lg)", padding: "1.5rem", boxShadow: `0 4px 20px ${cfg.bg}`, transition: "all 0.2s", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <cfg.Icon size={18} color={cfg.color} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>
                          Mesa {mesa.numero}
                        </h3>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
                        <Users size={13} /> {mesa.capacidad} {mesa.capacidad === 1 ? "persona" : "personas"}
                      </p>
                    </div>
                    <span style={{ padding: "5px 12px", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Botones */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(["disponible", "ocupada", "reservada"] as const).filter(s => s !== mesa.estado).map(s => {
                      const sc = estadoConfig[s];
                      return (
                        <button key={s} onClick={() => setStateChange({ id: mesa.id, newState: s })}
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px", borderRadius: "8px", background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
                          <sc.Icon size={13} /> Marcar como {sc.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
      </div>

      <ConfirmDialog
        isOpen={stateChange !== null}
        title="Cambiar estado de mesa"
        message={`¿Deseas cambiar el estado de la Mesa ${mesas.find(m => m.id === stateChange?.id)?.numero ?? ""} a "${stateChange?.newState}"?`}
        onConfirm={cambiarEstado}
        onCancel={() => setStateChange(null)}
        isDangerous={false}
      />
    </div>
  );
}
