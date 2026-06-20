"use client";

import { useEffect, useState } from "react";
import { Inbox, Flame, CheckCircle2, Plus, X, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { useNotification } from "@/components/Notification";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SkeletonCard } from "@/components/LoadingSpinner";

interface Plato  { id: number; nombre: string; precio: number; }
interface Mesa   { id: number; numero: number; }
interface Pedido { id: number; mesa: Mesa; platos: Plato[]; total: number; estado: string; }
interface Comanda {
  id: number;
  estado: string;
  observaciones?: string;
  pedido: Pedido;
  createdAt: string;
  updatedAt: string;
}

const ESTADOS = ["recibida", "en_preparacion", "lista"] as const;
type EstadoKey = typeof ESTADOS[number];

const estadoConfig: Record<EstadoKey, { label: string; Icon: React.ElementType; color: string; bg: string; border: string }> = {
  recibida:       { label: "Recibida",  Icon: Inbox,        color: "#eab308", bg: "rgba(234,179,8,0.1)",    border: "rgba(234,179,8,0.25)" },
  en_preparacion: { label: "Preparando", Icon: Flame,       color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)" },
  lista:          { label: "Lista",     Icon: CheckCircle2, color: "#10b981", bg: "rgba(16,185,129,0.1)",   border: "rgba(16,185,129,0.25)" },
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
  padding: "10px 20px", borderRadius: "8px", background: "transparent",
  border: "1px solid var(--border)", color: "var(--text-secondary)",
  fontWeight: 500, fontSize: "0.875rem", cursor: "pointer",
};

export default function ComandasPage() {
  const [comandas, setComandas]   = useState<Comanda[]>([]);
  const [pedidos, setPedidos]     = useState<Pedido[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [pedidoId, setPedidoId]   = useState("");
  const [obs, setObs]             = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [stateChange, setStateChange]   = useState<{ id: number; newState: string } | null>(null);
  const { notify } = useNotification();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cData, pData] = await Promise.all([
        api<Comanda[]>("/comandas"),
        api<Pedido[]>("/pedidos"),
      ]);
      setComandas(Array.isArray(cData) ? cData : []);
      setPedidos(Array.isArray(pData) ? pData : []);
      setError(false);
    } catch { setError(true); notify("Error al cargar comandas", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const crearComanda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pedidoId) { notify("Selecciona un pedido", "error"); return; }
    try {
      await api("/comandas", { method: "POST", body: { pedidoId: parseInt(pedidoId), observaciones: obs || undefined } });
      notify("Comanda creada correctamente", "success");
      setPedidoId(""); setObs(""); setShowForm(false); fetchData();
    } catch { notify("Error al crear comanda", "error"); }
  };

  const cambiarEstado = async () => {
    if (!stateChange) return;
    try {
      await api(`/comandas/${stateChange.id}/estado`, { method: "PATCH", body: { estado: stateChange.newState } });
      notify(`Comanda → ${stateChange.newState}`, "success");
      setStateChange(null); fetchData();
    } catch { notify("Error al cambiar estado", "error"); }
  };

  const filtered = comandas.filter(c => filterEstado === "todos" || c.estado === filterEstado);

  if (error) return (
    <div style={{ textAlign: "center", padding: "5rem 0" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}><Zap size={48} color="#ef4444" /></div>
      <h1 style={{ color: "#ef4444", margin: "0 0 0.5rem" }}>Error de conexión</h1>
      <p style={{ color: "var(--text-secondary)", margin: 0 }}>No se pudo conectar con el backend</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f59e0b" }}>Vista de cocina</p>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Comandas</h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {comandas.length} comandas · {comandas.filter(c => c.estado === "recibida").length} recibidas · {comandas.filter(c => c.estado === "en_preparacion").length} en preparación
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={showForm ? btnGhost : btnPrimary}>
          {showForm ? <><X size={15} /> Cancelar</> : <><Plus size={15} /> Nueva Comanda</>}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="animate-slide-down" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}><Inbox size={16} color="var(--gold)" /> Nueva Comanda</h3>
          <form onSubmit={crearComanda}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Pedido</label>
                <select value={pedidoId} onChange={e => setPedidoId(e.target.value)} required style={inputStyle}>
                  <option value="">Seleccionar pedido</option>
                  {pedidos.map(p => <option key={p.id} value={p.id}>Pedido #{p.id} — Mesa {p.mesa?.numero ?? "?"}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Observaciones (opcional)</label>
                <input type="text" placeholder="Ej: Sin cebolla" value={obs} onChange={e => setObs(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <button type="submit" style={{ ...btnPrimary, padding: "10px 28px" }}>Crear Comanda</button>
          </form>
        </div>
      )}

      {/* Filtro */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: "200px" }}>
          <option value="todos">Todos los estados</option>
          {ESTADOS.map(s => <option key={s} value={s}>{estadoConfig[s].label}</option>)}
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1rem" }}>
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", color: "var(--text-muted)" }}>
          No hay comandas para mostrar
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1rem" }}>
          {filtered.map(c => {
            const cfg = estadoConfig[c.estado as EstadoKey] ?? estadoConfig["recibida"];
            return (
              <div key={c.id} className="animate-fade-in" style={{ background: "var(--bg-card)", border: `1px solid ${cfg.border}`, borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <div style={{ height: "3px", background: cfg.color }} />
                <div style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                      <p style={{ margin: "0 0 2px", fontWeight: 800, color: "var(--text-primary)" }}>Comanda #{c.id}</p>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Pedido #{c.pedido?.id} · Mesa {c.pedido?.mesa?.numero ?? "?"}
                      </p>
                      {c.observaciones && (
                        <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--gold)", fontStyle: "italic" }}>"{c.observaciones}"</p>
                      )}
                    </div>
                    <span style={{ padding: "4px 10px", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <cfg.Icon size={11} /> {cfg.label}
                    </span>
                  </div>

                  {/* Platos del pedido */}
                  {c.pedido?.platos?.length > 0 && (
                    <div style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
                      <p style={{ margin: "0 0 6px", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Platos</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                        {c.pedido.platos.map(p => (
                          <span key={p.id} style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600, background: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                            {p.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botones cambio de estado */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {ESTADOS.filter(s => s !== c.estado).map(s => {
                      const sc = estadoConfig[s];
                      return (
                        <button key={s} onClick={() => setStateChange({ id: c.id, newState: s })}
                          style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "7px", borderRadius: "7px", background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                          <sc.Icon size={13} /> Marcar como {sc.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={stateChange !== null}
        title="Cambiar estado de comanda"
        message={`¿Cambiar Comanda #${stateChange?.id} a "${stateChange?.newState}"?`}
        onConfirm={cambiarEstado}
        onCancel={() => setStateChange(null)}
        isDangerous={false}
      />
    </div>
  );
}
