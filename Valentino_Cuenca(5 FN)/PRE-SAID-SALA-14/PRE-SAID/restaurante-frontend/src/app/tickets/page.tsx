"use client";

import { useEffect, useState } from "react";
import { Receipt, CreditCard, Banknote, Plus, X, Zap, CheckCircle2, Circle } from "lucide-react";
import { api } from "@/lib/api";
import { useNotification } from "@/components/Notification";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SkeletonCard } from "@/components/LoadingSpinner";

interface Mesa   { id: number; numero: number; }
interface Pedido { id: number; total: number; estado: string; }
interface Ticket {
  id: number;
  total: number;
  metodoPago?: string;
  estado: string;
  mesa: Mesa;
  createdAt: string;
}

const metodoPagoOpts = ["efectivo", "tarjeta"];

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

export default function TicketsPage() {
  const [tickets, setTickets]         = useState<Ticket[]>([]);
  const [mesas, setMesas]             = useState<Mesa[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [showForm, setShowForm]       = useState(false);
  const [mesaId, setMesaId]           = useState("");
  const [pagarId, setPagarId]         = useState<number | null>(null);
  const [metodoPago, setMetodoPago]   = useState("efectivo");
  const [filterEstado, setFilterEstado] = useState("todos");
  const { notify } = useNotification();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tData, mData] = await Promise.all([
        api<Ticket[]>("/tickets"),
        api<Mesa[]>("/mesas"),
      ]);
      setTickets(Array.isArray(tData) ? tData : []);
      setMesas(Array.isArray(mData) ? mData : []);
      setError(false);
    } catch { setError(true); notify("Error al cargar tickets", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const crearTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesaId) { notify("Selecciona una mesa", "error"); return; }
    try {
      await api("/tickets", { method: "POST", body: { mesaId: parseInt(mesaId) } });
      notify("Ticket generado correctamente", "success");
      setMesaId(""); setShowForm(false); fetchData();
    } catch (err: any) {
      notify(err?.message?.includes("no tiene pedidos") ? "La mesa no tiene pedidos registrados" : "Error al generar ticket", "error");
    }
  };

  const pagarTicket = async () => {
    if (!pagarId) return;
    try {
      await api(`/tickets/${pagarId}/pagar`, { method: "PATCH", body: { metodoPago } });
      notify("Ticket pagado correctamente ✓", "success");
      setPagarId(null); fetchData();
    } catch { notify("Error al procesar el pago", "error"); }
  };

  const filtered = tickets.filter(t => filterEstado === "todos" || t.estado === filterEstado);
  const totalRecaudado = tickets.filter(t => t.estado === "pagado").reduce((s, t) => s + Number(t.total), 0);

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
          <p style={{ margin: "0 0 4px", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#10b981" }}>Caja y facturación</p>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Tickets</h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {tickets.length} tickets · {tickets.filter(t => t.estado === "pagado").length} pagados
            {totalRecaudado > 0 && <span style={{ marginLeft: "8px", color: "#10b981", fontWeight: 700 }}>· S/ {totalRecaudado.toFixed(2)} recaudados</span>}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={showForm ? btnGhost : btnPrimary}>
          {showForm ? <><X size={15} /> Cancelar</> : <><Plus size={15} /> Generar Ticket</>}
        </button>
      </div>

      {/* Resumen recaudación */}
      {!loading && tickets.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "12px", marginBottom: "1.5rem" }}>
          {[
            { label: "Total tickets",  value: tickets.length,                                          color: "var(--text-primary)" },
            { label: "Pagados",        value: tickets.filter(t => t.estado === "pagado").length,       color: "#10b981" },
            { label: "Abiertos",       value: tickets.filter(t => t.estado === "abierto").length,      color: "#f59e0b" },
            { label: "Recaudado",      value: `S/ ${totalRecaudado.toFixed(2)}`,                       color: "#10b981" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px 16px" }}>
              <p style={{ margin: "0 0 4px", fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
              <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Formulario crear ticket */}
      {showForm && (
        <div className="animate-slide-down" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>🧾 Generar Ticket</h3>
          <form onSubmit={crearTicket}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "end" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Mesa</label>
                <select value={mesaId} onChange={e => setMesaId(e.target.value)} required style={inputStyle}>
                  <option value="">Seleccionar mesa</option>
                  {mesas.map(m => <option key={m.id} value={m.id}>Mesa {m.numero}</option>)}
                </select>
              </div>
              <button type="submit" style={{ ...btnPrimary, height: "42px" }}>Generar</button>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Se sumará el total de todos los pedidos de la mesa seleccionada.
            </p>
          </form>
        </div>
      )}

      {/* Filtro */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: "200px" }}>
          <option value="todos">Todos los tickets</option>
          <option value="abierto">🟡 Abiertos</option>
          <option value="pagado">✅ Pagados</option>
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1rem" }}>
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", color: "var(--text-muted)" }}>
          🧾 No hay tickets para mostrar
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1rem" }}>
          {filtered.map(ticket => {
            const pagado = ticket.estado === "pagado";
            return (
              <div key={ticket.id} className="animate-fade-in" style={{
                background: "var(--bg-card)",
                border: `1px solid ${pagado ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
                borderRadius: "var(--radius-lg)", overflow: "hidden",
              }}>
                {/* Barra top */}
                <div style={{ height: "3px", background: pagado ? "#10b981" : "#f59e0b" }} />
                <div style={{ padding: "1.25rem" }}>
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                      <p style={{ margin: "0 0 2px", fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)" }}>Ticket #{ticket.id}</p>
                      <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        <Receipt size={13} style={{ marginRight: "4px", display: "inline" }} />
                        Mesa {ticket.mesa?.numero ?? "?"} · {new Date(ticket.createdAt).toLocaleString("es-PE")}
                      </p>
                      {ticket.metodoPago && (
                        <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#10b981" }}>
                          <CreditCard size={12} style={{ marginRight: "4px", display: "inline" }} />
                          Pagado con {ticket.metodoPago}
                        </p>
                      )}
                    </div>
                    <span style={{
                      padding: "4px 12px", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 700,
                      background: pagado ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                      color: pagado ? "#10b981" : "#f59e0b",
                      border: `1px solid ${pagado ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
                      display: "inline-flex", alignItems: "center", gap: "4px",
                    }}>
                      {pagado ? <><CheckCircle2 size={11} /> Pagado</> : <><Circle size={11} /> Abierto</>}
                    </span>
                  </div>

                  {/* Total */}
                  <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Total a pagar</span>
                    <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--gold)", lineHeight: 1 }}>
                      S/ {Number(ticket.total).toFixed(2)}
                    </span>
                  </div>

                  {/* Botón pagar */}
                  {!pagado && (
                    <button
                      onClick={() => { setPagarId(ticket.id); setMetodoPago("efectivo"); }}
                      style={{ ...btnPrimary, width: "100%", justifyContent: "center", padding: "10px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <Banknote size={15} /> Cobrar ticket
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal pago */}
      {pagarId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
          onClick={() => setPagarId(null)}>
          <div className="animate-zoom-in" onClick={e => e.stopPropagation()} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: "400px", overflow: "hidden" }}>
            <div style={{ padding: "1.5rem 1.5rem 1rem", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>💰 Cobrar Ticket #{pagarId}</h2>
            </div>
            <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Método de pago</label>
              <div style={{ display: "flex", gap: "10px", marginBottom: "1.5rem" }}>
                {metodoPagoOpts.map(m => (
                  <button key={m} onClick={() => setMetodoPago(m)} style={{
                    flex: 1, padding: "12px", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem",
                    background: metodoPago === m ? "rgba(245,158,11,0.15)" : "var(--bg-input)",
                    border: `1px solid ${metodoPago === m ? "rgba(245,158,11,0.4)" : "var(--border)"}`,
                    color: metodoPago === m ? "#f59e0b" : "var(--text-secondary)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  }}>
                    {m === "efectivo" ? <><Banknote size={15} /> Efectivo</> : <><CreditCard size={15} /> Tarjeta</>}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setPagarId(null)} style={{ ...btnGhost, flex: 1, justifyContent: "center" }}>Cancelar</button>
                <button onClick={pagarTicket} style={{ ...btnPrimary, flex: 1, justifyContent: "center" }}>Confirmar cobro</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
