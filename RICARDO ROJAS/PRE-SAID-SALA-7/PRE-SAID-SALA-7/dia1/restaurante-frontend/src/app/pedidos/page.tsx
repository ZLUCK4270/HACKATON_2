"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Plato {
  id: number;
  nombre: string;
  precio: string;
}

interface Mesa {
  id: number;
  numero: number;
}

interface Pedido {
  id: number;
  mesaId: number;
  mesa: Mesa;
  platos: Plato[];
  estado: string;
  total: string;
}

const estados = ["pendiente", "en_preparacion", "listo", "entregado"] as const;

const estadoBadge: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-700",
  en_preparacion: "bg-blue-100 text-blue-700",
  listo: "bg-green-100 text-green-700",
  entregado: "bg-gray-100 text-gray-600",
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [mesaId, setMesaId] = useState("");
  const [platoIds, setPlatoIds] = useState<number[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pedRes, mesRes, plaRes] = await Promise.all([
        fetch(`${API}/pedidos`),
        fetch(`${API}/mesas`),
        fetch(`${API}/platos`),
      ]);
      if (!pedRes.ok || !mesRes.ok || !plaRes.ok) throw new Error();
      setPedidos(await pedRes.json());
      setMesas(await mesRes.json());
      setPlatos(await plaRes.json());
    } catch {
      setError("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setMesaId("");
    setPlatoIds([]);
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (ped: Pedido) => {
    setMesaId(String(ped.mesaId));
    setPlatoIds(ped.platos.map((p) => p.id));
    setEditId(ped.id);
    setShowForm(true);
  };

  const togglePlato = (id: number) => {
    setPlatoIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesaId || platoIds.length === 0) return;
    try {
      const body = { mesaId: Number(mesaId), platoIds };
      const res = editId
        ? await fetch(`${API}/pedidos/${editId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`${API}/pedidos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      if (!res.ok) throw new Error();
      resetForm();
      await fetchData();
    } catch {
      setError(editId ? "No se pudo actualizar el pedido." : "No se pudo crear el pedido.");
    }
  };

  const cambiarEstado = async (id: number, actual: string) => {
    const idx = estados.indexOf(actual as typeof estados[number]);
    if (idx < 0 || idx >= estados.length - 1) return;
    const nuevo = estados[idx + 1];
    try {
      const res = await fetch(`${API}/pedidos/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevo }),
      });
      if (!res.ok) throw new Error();
      await fetchData();
    } catch {
      setError("No se pudo cambiar el estado.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este pedido?")) return;
    try {
      const res = await fetch(`${API}/pedidos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await fetchData();
    } catch {
      setError("No se pudo eliminar el pedido.");
    }
  };

  if (loading) return <p className="text-gray-500">Cargando pedidos...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition"
        >
          {showForm ? "Cancelar" : "+ Nuevo Pedido"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
          {error}
          <button onClick={() => setError("")} className="float-right font-bold">&times;</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mesa</label>
              <select value={mesaId} onChange={(e) => setMesaId(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Seleccionar mesa...</option>
                {mesas.map((m) => (
                  <option key={m.id} value={m.id}>Mesa #{m.numero}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Platos</label>
            <div className="flex flex-wrap gap-2">
              {platos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlato(p.id)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition ${
                    platoIds.includes(p.id)
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-orange-400"
                  }`}
                >
                  {p.nombre} — ${Number(p.precio).toFixed(2)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" disabled={!mesaId || platoIds.length === 0} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50">
              {editId ? "Actualizar Pedido" : "Crear Pedido"}
            </button>
            {editId && (
              <button type="button" onClick={resetForm} className="text-sm text-gray-500 hover:underline">Cancelar edición</button>
            )}
          </div>
        </form>
      )}

      <div className="space-y-3">
        {pedidos.map((ped) => {
          const idx = estados.indexOf(ped.estado as typeof estados[number]);
          const next = idx >= 0 && idx < estados.length - 1 ? estados[idx + 1] : null;
          return (
            <div key={ped.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Pedido #{ped.id} — Mesa #{ped.mesa?.numero ?? ped.mesaId}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estadoBadge[ped.estado] || "bg-gray-100 text-gray-600"}`}>
                  {ped.estado.replace("_", " ")}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-1">
                Platos: {ped.platos?.map((pl) => pl.nombre).join(", ") || "—"}
              </div>
              <div className="text-sm font-semibold mb-2">Total: ${Number(ped.total).toFixed(2)}</div>
              <div className="flex gap-2">
                {next && (
                  <button onClick={() => cambiarEstado(ped.id, ped.estado)} className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-700 transition">
                    Pasar a {next.replace("_", " ")}
                  </button>
                )}
                <button onClick={() => openEdit(ped)} className="text-blue-600 text-xs hover:underline">Editar</button>
                <button onClick={() => handleDelete(ped.id)} className="text-red-500 text-xs hover:underline">Eliminar</button>
              </div>
            </div>
          );
        })}
        {pedidos.length === 0 && (
          <p className="text-center text-gray-400 py-8">No hay pedidos registrados</p>
        )}
      </div>
    </div>
  );
}
