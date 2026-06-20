"use client";

import { useEffect, useState } from "react";
import { Search, Plus, X, Clock, ChefHat, CheckCircle2, Package, Zap, UtensilsCrossed } from "lucide-react";
import { api } from "@/lib/api";
import { useNotification } from "@/components/Notification";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SkeletonCard } from "@/components/LoadingSpinner";

interface Plato  { id: number; nombre: string; precio: number; }
interface Mesa   { id: number; numero: number; }
interface Pedido { id: number; mesa: Mesa; platos: Plato[]; estado: string; total: number; createdAt: string; }

const ESTADOS = ["pendiente", "en_preparacion", "listo", "entregado"] as const;
type EstadoKey = typeof ESTADOS[number];

const estadoConfig: Record<EstadoKey, { label: string; Icon: React.ElementType; color: string; bg: string; border: string }> = {
  pendiente:      { label: "Pendiente",  Icon: Clock,         color: "#eab308", bg: "rgba(234,179,8,0.1)",    border: "rgba(234,179,8,0.25)" },
  en_preparacion: { label: "Preparando", Icon: ChefHat,       color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)" },
  listo:          { label: "Listo",      Icon: CheckCircle2,  color: "#10b981", bg: "rgba(16,185,129,0.1)",   border: "rgba(16,185,129,0.25)" },
  entregado:      { label: "Entregado",  Icon: Package,       color: "#71717a", bg: "rgba(113,113,122,0.08)", border: "rgba(113,113,122,0.2)" },
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

function ProgressBar({ estado }: { estado: string }) {
  const idx = ESTADOS.indexOf(estado as EstadoKey);
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      {ESTADOS.map((s, i) => {
        const cfg = estadoConfig[s];
        const active = i <= idx;
        return (
          <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{ height: "4px", borderRadius: "99px", width: "100%", background: active ? cfg.color : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />
            {i === idx && (
              <span style={{ fontSize: "0.65rem", color: cfg.color, fontWeight: 700, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "3px" }}>
                <cfg.Icon size={10} /> {cfg.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PedidosPage() {
  const [pedidos, setPedidos]     = useState<Pedido[]>([]);
  const [platos, setPlatos]       = useState<Plato[]>([]);
  const [mesas, setMesas]         = useState<Mesa[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [mesaId, setMesaId]       = useState("");
  const [platoIds, setPlatoIds]   = useState<number[]>([]);
  const [search, setSearch]       = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [stateChange, setStateChange] = useState<{ id: number; newState: string } | null>(null);
  const { notify } = useNotification();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pedidosData, platosData, mesasData] = await Promise.all([
        api<Pedido[]>("/pedidos"), api<Plato[]>("/platos"), api<Mesa[]>("/mesas"),
      ]);
      setPedidos(Array.isArray(pedidosData) ? pedidosData : []);
      setPlatos(Array.isArray(platosData) ? platosData : []);
      setMesas(Array.isArray(mesasData) ? mesasData : []);
      setError(false);
    } catch { setError(true); notify("Error al cargar datos", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const togglePlato = (id: number) =>
    setPlatoIds((prev) => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const crearPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesaId || platoIds.length === 0) { notify("Selecciona mesa y al menos un plato", "error"); return; }
    try {
      await api("/pedidos", { method: "POST", body: { mesaId: parseInt(mesaId), platoIds } });
      notify("Pedido creado correctamente", "success");
      setMesaId(""); setPlatoIds([]); setShowForm(false); fetchData();
    } catch { notify("Error al crear pedido", "error"); }
  };

  const cambiarEstadoPedido = async () => {
    if (!stateChange) return;
    try {
      await api(`/pedidos/${stateChange.id}/estado`, { method: "PATCH", body: { estado: stateChange.newState } });
      notify(`Pedido actualizado`, "success");
      setStateChange(null); fetchData();
    } catch { notify("Error al cambiar estado", "error"); }
  };

  const filteredPedidos = pedidos
    .filter(p => { const t = search.toLowerCase(); return p.mesa?.numero.toString().includes(t) || p.id.toString().includes(t); })
    .filter(p => filterEstado === "todos" || p.estado === filterEstado);

  const totalPendientes = pedidos.filter(p => p.estado === "pendiente").length;

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
          <p style={{ margin: "0 0 4px", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3b82f6" }}>Control de cocina</p>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Pedidos</h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {pedidos.length} pedidos en total
            {totalPendientes > 0 && (
              <span style={{ marginLeft: "8px", padding: "2px 8px", borderRadius: "99px", background: "rgba(234,179,8,0.15)", color: "#eab308", fontWeight: 700, fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Clock size={11} /> {totalPendientes} pendientes
              </span>
            )}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={showForm ? btnGhost : btnPrimary}>
          {showForm ? <><X size={15} /> Cancelar</> : <><Plus size={15} /> Nuevo Pedido</>}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="animate-slide-down" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus size={16} color="var(--gold)" /> Nuevo Pedido
          </h3>
          <form onSubmit={crearPedido}>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Mesa</label>
              <select value={mesaId} onChange={(e) => setMesaId(e.target.value)} required style={inputStyle}>
                <option value="">Seleccionar mesa</option>
                {mesas.map(m => <option key={m.id} value={m.id}>Mesa {m.numero}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                Platos — <span style={{ color: "var(--gold)" }}>{platoIds.length} seleccionados</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px" }}>
                {platos.map(p => {
                  const sel = platoIds.includes(p.id);
                  return (
                    <label key={p.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "10px", cursor: "pointer", border: `1px solid ${sel ? "rgba(245,158,11,0.4)" : "var(--border)"}`, background: sel ? "rgba(245,158,11,0.08)" : "var(--bg-input)", transition: "all 0.15s" }}>
                      <input type="checkbox" checked={sel} onChange={() => togglePlato(p.id)} style={{ accentColor: "#f59e0b", width: "16px", height: "16px" }} />
                      <div>
                        <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{p.nombre}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--gold)", fontWeight: 700 }}>S/ {p.precio.toFixed(2)}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            {platoIds.length > 0 && (
              <div style={{ marginBottom: "1.25rem", padding: "12px 16px", borderRadius: "10px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Total estimado:</span>
                <span style={{ color: "var(--gold)", fontWeight: 800, fontSize: "1rem" }}>
                  S/ {platos.filter(p => platoIds.includes(p.id)).reduce((acc, p) => acc + p.precio, 0).toFixed(2)}
                </span>
              </div>
            )}
            <button type="submit" style={{ ...btnPrimary, width: "100%", justifyContent: "center", padding: "12px" }}>Crear Pedido</button>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input type="text" placeholder="Buscar por mesa o ID..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "36px" }} />
        </div>
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: "180px" }}>
          <option value="todos">Todos los estados</option>
          {ESTADOS.map(s => <option key={s} value={s}>{estadoConfig[s].label}</option>)}
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
      ) : filteredPedidos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", color: "var(--text-muted)" }}>No hay pedidos para mostrar</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredPedidos.map(pedido => {
            const cfg = estadoConfig[pedido.estado as EstadoKey] ?? estadoConfig["pendiente"];
            return (
              <div key={pedido.id} className="animate-fade-in" style={{ background: "var(--bg-card)", border: `1px solid ${cfg.border}`, borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <div style={{ height: "3px", background: cfg.color, opacity: 0.8 }} />
                <div style={{ padding: "1.25rem 1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)" }}>Pedido #{pedido.id}</span>
                        <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <cfg.Icon size={11} /> {cfg.label}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
                        <UtensilsCrossed size={13} /> Mesa {pedido.mesa?.numero ?? "?"} · {new Date(pedido.createdAt).toLocaleString("es-PE")}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: "0 0 2px", fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total</p>
                      <p style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "var(--gold)", lineHeight: 1 }}>S/ {Number(pedido.total).toFixed(2)}</p>
                    </div>
                  </div>
                  <div style={{ marginBottom: "1rem" }}><ProgressBar estado={pedido.estado} /></div>
                  <div style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
                    <p style={{ margin: "0 0 8px", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Platos</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {(pedido.platos || []).map(plato => (
                        <span key={plato.id} style={{ padding: "4px 12px", borderRadius: "99px", fontSize: "0.78rem", fontWeight: 600, background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
                          {plato.nombre} · <span style={{ color: "var(--gold)" }}>S/ {plato.precio.toFixed(2)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {ESTADOS.filter(s => s !== pedido.estado).map(s => {
                      const sc = estadoConfig[s];
                      return (
                        <button key={s} onClick={() => setStateChange({ id: pedido.id, newState: s })}
                          style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "7px", background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                          <sc.Icon size={13} /> {sc.label}
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

      <ConfirmDialog isOpen={stateChange !== null} title="Cambiar estado del pedido" message={`¿Deseas cambiar el Pedido #${stateChange?.id} a "${stateChange?.newState}"?`} onConfirm={cambiarEstadoPedido} onCancel={() => setStateChange(null)} isDangerous={false} />
    </div>
  );
}
