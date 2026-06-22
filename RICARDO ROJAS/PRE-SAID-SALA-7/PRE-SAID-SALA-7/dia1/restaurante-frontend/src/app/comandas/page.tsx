"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Pedido {
  id: number;
  mesa: { id: number; numero: number };
  platos: { nombre: string }[];
  total: string;
  estado: string;
}

interface Comanda {
  id: number;
  pedidoId: number;
  pedido: Pedido;
  observaciones: string | null;
  estado: string;
  createdAt: string;
}

  const estados = ["recibida", "en_preparacion", "lista"] as const;

const estadoBadge: Record<string, string> = {
  recibida: "bg-yellow-100 text-yellow-700",
  en_preparacion: "bg-blue-100 text-blue-700",
  lista: "bg-green-100 text-green-700",
};

export default function ComandasPage() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [pedidoId, setPedidoId] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Comanda | null>(null);

  const fetchComandas = async () => {
    try {
      setLoading(true);
      setError("");
      const [comRes, pedRes] = await Promise.all([
        fetch(`${API}/comandas`),
        fetch(`${API}/pedidos`),
      ]);
      if (!comRes.ok || !pedRes.ok) throw new Error("Error al obtener datos");
      setComandas(await comRes.json());
      setPedidos(await pedRes.json());
    } catch (e) {
      setError(`No se pudieron cargar las comandas: ${e instanceof Error ? e.message : "verificá que el backend esté corriendo"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComandas(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pedidoId) return;
    try {
      const res = await fetch(`${API}/comandas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedidoId: Number(pedidoId),
          observaciones: observaciones || undefined,
        }),
      });
      if (!res.ok) throw new Error("Error al crear comanda");
      setPedidoId("");
      setObservaciones("");
      setShowForm(false);
      await fetchComandas();
    } catch {
      setError("No se pudo crear la comanda.");
    }
  };

  const cambiarEstado = async (id: number, estado: string) => {
    setError("");
    try {
      const res = await fetch(`${API}/comandas/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error del servidor");
      }
      await fetchComandas();
    } catch (e) {
      setError(`No se pudo cambiar el estado: ${e instanceof Error ? e.message : "error desconocido"}`);
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar esta comanda?")) return;
    try {
      const res = await fetch(`${API}/comandas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await fetchComandas();
    } catch {
      setError("No se pudo eliminar la comanda.");
    }
  };

  const toggleDetail = async (id: number) => {
    if (detailId === id) {
      setDetailId(null);
      setDetail(null);
      return;
    }
    try {
      const res = await fetch(`${API}/comandas/${id}`);
      if (!res.ok) throw new Error();
      setDetail(await res.json());
      setDetailId(id);
    } catch {
      setError("No se pudo cargar el detalle de la comanda.");
    }
  };

  const normalizeEstado = (e: string) => e.toLowerCase();

  const nextEstado = (actual: string) => {
    const normal = normalizeEstado(actual);
    const idx = estados.indexOf(normal as typeof estados[number]);
    if (idx >= 0 && idx < estados.length - 1) return estados[idx + 1];
    if (normal === "lista") return null;
    return null;
  };

  const badgeClass = (estado: string) => {
    const normal = normalizeEstado(estado);
    return estadoBadge[normal] || "bg-gray-100 text-gray-600";
  };

  if (loading) return <p className="text-gray-500">Cargando comandas...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Comandas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition"
        >
          {showForm ? "Cancelar" : "+ Nueva Comanda"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
          {error}
          <button onClick={() => setError("")} className="float-right font-bold">&times;</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow p-4 mb-6 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Pedido</label>
            <select
              value={pedidoId}
              onChange={(e) => setPedidoId(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Seleccionar pedido...</option>
              {pedidos.map((p) => (
                <option key={p.id} value={p.id}>
                  Pedido #{p.id} — Mesa #{p.mesa?.numero} — ${Number(p.total).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
            Crear Comanda
          </button>
        </form>
      )}

      <div className="space-y-3">
        {comandas.map((c) => {
          const sig = nextEstado(c.estado);
          const displayEstado = normalizeEstado(c.estado);
          return (
            <div key={c.id} className="bg-white rounded-xl shadow">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">Comanda #{c.id}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass(c.estado)}`}>
                        {c.estado.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Pedido #{c.pedidoId} — Mesa #{c.pedido?.mesa?.numero ?? "?"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Platos: {c.pedido?.platos?.map((pl) => pl.nombre).join(", ") || "—"}
                    </p>
                    {c.observaciones && (
                      <p className="text-sm text-gray-400 italic mt-1">Obs: {c.observaciones}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleDetail(c.id)} className="text-gray-600 text-xs hover:underline">
                      {detailId === c.id ? "Ocultar" : "Ver detalle"}
                    </button>
                    {sig ? (
                      <button onClick={() => cambiarEstado(c.id, sig)} className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-700 transition">
                        Pasar a {sig.replace("_", " ")}
                      </button>
                    ) : displayEstado === "lista" ? (
                      <span className="text-xs text-gray-400 italic">Completada</span>
                    ) : null}
                    <button onClick={() => eliminar(c.id)} className="text-red-500 text-xs hover:underline">Eliminar</button>
                  </div>
                </div>
              </div>
              {detailId === c.id && detail && (
                <div className="border-t px-4 py-3 bg-gray-50 rounded-b-xl text-sm space-y-1">
                  <p><span className="font-medium">Comanda ID:</span> {detail.id}</p>
                  <p><span className="font-medium">Pedido ID:</span> {detail.pedidoId}</p>
                  <p><span className="font-medium">Mesa:</span> #{detail.pedido?.mesa?.numero}</p>
                  <p><span className="font-medium">Platos:</span> {detail.pedido?.platos?.map((pl) => pl.nombre).join(", ")}</p>
                  <p><span className="font-medium">Total pedido:</span> ${Number(detail.pedido?.total).toFixed(2)}</p>
                  <p><span className="font-medium">Estado pedido:</span> {detail.pedido?.estado?.replace("_", " ")}</p>
                  <p><span className="font-medium">Estado comanda:</span> {detail.estado.replace("_", " ")}</p>
                  <p><span className="font-medium">Observaciones:</span> {detail.observaciones || "—"}</p>
                  <p><span className="font-medium">Creada:</span> {new Date(detail.createdAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          );
        })}
        {comandas.length === 0 && (
          <p className="text-center text-gray-400 py-8">No hay comandas registradas</p>
        )}
      </div>
    </div>
  );
}
