"use client";

import { useEffect, useState } from "react";
import { Search, Plus, X, Pencil, Trash2, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { useNotification } from "@/components/Notification";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SkeletonRow } from "@/components/LoadingSpinner";

interface Plato { id: number; nombre: string; precio: number; disponible: boolean; }

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

export default function PlatosPage() {
  const [platos, setPlatos]     = useState<Plato[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombre, setNombre]     = useState("");
  const [precio, setPrecio]     = useState("");
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<"todos" | "disponibles" | "no_disponibles">("todos");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { notify } = useNotification();

  const fetchPlatos = async () => {
    try {
      setLoading(true);
      const data = await api<Plato[]>("/platos");
      setPlatos(data);
      setError(false);
    } catch {
      setError(true);
      notify("Error al cargar platos", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPlatos(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !precio) { notify("Por favor completa todos los campos", "error"); return; }
    try {
      if (editingId) {
        await api(`/platos/${editingId}`, { method: "PATCH", body: { nombre, precio: parseFloat(precio) } });
        notify("Plato actualizado correctamente", "success");
      } else {
        await api("/platos", { method: "POST", body: { nombre, precio: parseFloat(precio) } });
        notify("Plato creado correctamente", "success");
      }
      setNombre(""); setPrecio(""); setShowForm(false); setEditingId(null);
      fetchPlatos();
    } catch { notify("Error al guardar plato", "error"); }
  };

  const handleEdit = (plato: Plato) => {
    setEditingId(plato.id); setNombre(plato.nombre);
    setPrecio(plato.precio.toString()); setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api(`/platos/${deleteId}`, { method: "DELETE" });
      notify("Plato eliminado correctamente", "success");
      setDeleteId(null); fetchPlatos();
    } catch { notify("Error al eliminar plato", "error"); }
  };

  const filteredPlatos = platos
    .filter((p) => p.nombre.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => {
      if (filter === "disponibles")    return p.disponible;
      if (filter === "no_disponibles") return !p.disponible;
      return true;
    });

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
          <p style={{ margin: "0 0 4px", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)" }}>Menú del restaurante</p>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Platos</h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {platos.length} platos registrados · {platos.filter(p => p.disponible).length} disponibles
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setNombre(""); setPrecio(""); }}
          style={showForm ? btnGhost : btnPrimary}
        >
          {showForm ? <><X size={15} /> Cancelar</> : <><Plus size={15} /> Nuevo Plato</>}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="animate-slide-down" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Pencil size={16} color="var(--gold)" />
            {editingId ? "Editar Plato" : "Nuevo Plato"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", alignItems: "end" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Nombre del plato</label>
                <input type="text" placeholder="Ej: Lomo saltado" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Precio (S/)</label>
                <input type="number" placeholder="0.00" value={precio} onChange={(e) => setPrecio(e.target.value)} required step="0.01" min="0" style={inputStyle} />
              </div>
              <button type="submit" style={{ ...btnPrimary, height: "42px", whiteSpace: "nowrap" }}>
                {editingId ? "Actualizar" : "Crear Plato"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input type="text" placeholder="Buscar por nombre..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: "36px" }} />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} style={{ ...inputStyle, width: "auto", minWidth: "180px" }}>
          <option value="todos">Todos los platos</option>
          <option value="disponibles">Disponibles</option>
          <option value="no_disponibles">No disponibles</option>
        </select>
      </div>

      {/* Tabla */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["#", "Nombre", "Precio", "Estado", "Acciones"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "14px 20px", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1,2,3].map((i) => <SkeletonRow key={i} />)
            ) : filteredPlatos.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  No hay platos para mostrar
                </td>
              </tr>
            ) : (
              filteredPlatos.map((plato, idx) => (
                <tr key={plato.id} style={{ borderBottom: idx < filteredPlatos.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td style={{ padding: "14px 20px", color: "var(--text-muted)", fontSize: "0.82rem" }}>#{plato.id}</td>
                  <td style={{ padding: "14px 20px", fontWeight: 600, color: "var(--text-primary)" }}>{plato.nombre}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: "1rem" }}>S/ {plato.precio.toFixed(2)}</span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      padding: "4px 12px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600,
                      background: plato.disponible ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
                      color: plato.disponible ? "#10b981" : "#ef4444",
                      border: `1px solid ${plato.disponible ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}`,
                    }}>
                      {plato.disponible ? "Disponible" : "No disponible"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleEdit(plato)} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 14px", borderRadius: "6px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                        <Pencil size={13} /> Editar
                      </button>
                      <button onClick={() => setDeleteId(plato.id)} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 14px", borderRadius: "6px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                        <Trash2 size={13} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog isOpen={deleteId !== null} title="Eliminar plato" message="¿Estás seguro de que deseas eliminar este plato? Esta acción no se puede deshacer." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isDangerous />
    </div>
  );
}
