"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: string;
}

const estadoColors: Record<string, string> = {
  disponible: "border-green-400 bg-green-50",
  ocupada: "border-red-400 bg-red-50",
  reservada: "border-yellow-400 bg-yellow-50",
};

const estadoBadge: Record<string, string> = {
  disponible: "bg-green-100 text-green-700",
  ocupada: "bg-red-100 text-red-700",
  reservada: "bg-yellow-100 text-yellow-700",
};

const nextEstado: Record<string, string> = {
  disponible: "ocupada",
  ocupada: "reservada",
  reservada: "disponible",
};

export default function MesasPage() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [numero, setNumero] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [estado, setEstado] = useState("disponible");

  const fetchMesas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/mesas`);
      if (!res.ok) throw new Error();
      setMesas(await res.json());
    } catch {
      setError("No se pudieron cargar las mesas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMesas(); }, []);

  const resetForm = () => {
    setNumero("");
    setCapacidad("");
    setEstado("disponible");
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (m: Mesa) => {
    setNumero(String(m.numero));
    setCapacidad(String(m.capacidad));
    setEstado(m.estado);
    setEditId(m.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = { numero: Number(numero), capacidad: Number(capacidad), estado };
      const res = editId
        ? await fetch(`${API}/mesas/${editId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`${API}/mesas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      if (!res.ok) throw new Error();
      resetForm();
      await fetchMesas();
    } catch {
      setError(editId ? "No se pudo actualizar la mesa." : "No se pudo crear la mesa.");
    }
  };

  const cambiarEstado = async (id: number, estadoActual: string) => {
    const nuevo = nextEstado[estadoActual] || "disponible";
    try {
      const res = await fetch(`${API}/mesas/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevo }),
      });
      if (!res.ok) throw new Error();
      await fetchMesas();
    } catch {
      setError("No se pudo cambiar el estado.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta mesa?")) return;
    try {
      const res = await fetch(`${API}/mesas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await fetchMesas();
    } catch {
      setError("No se pudo eliminar la mesa.");
    }
  };

  if (loading) return <p className="text-gray-500">Cargando mesas...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Mesas</h1>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition"
        >
          {showForm ? "Cancelar" : "+ Nueva Mesa"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
          {error}
          <button onClick={() => setError("")} className="float-right font-bold">&times;</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap items-end gap-3">
          <div className="w-28">
            <label className="block text-xs text-gray-500 mb-1">Número</label>
            <input value={numero} onChange={(e) => setNumero(e.target.value)} type="number" min="1" required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="w-32">
            <label className="block text-xs text-gray-500 mb-1">Capacidad</label>
            <input value={capacidad} onChange={(e) => setCapacidad(e.target.value)} type="number" min="1" required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="w-32">
            <label className="block text-xs text-gray-500 mb-1">Estado</label>
            <select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="disponible">Disponible</option>
              <option value="ocupada">Ocupada</option>
              <option value="reservada">Reservada</option>
            </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
            {editId ? "Actualizar" : "Guardar"}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="text-sm text-gray-500 hover:underline">Cancelar edición</button>
          )}
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mesas.map((m) => (
          <div key={m.id} className={`bg-white rounded-xl shadow border-l-4 p-4 ${estadoColors[m.estado] || "border-gray-300"}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">Mesa #{m.numero}</h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estadoBadge[m.estado] || "bg-gray-100 text-gray-600"}`}>
                {m.estado}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Capacidad: {m.capacidad} personas</p>
            <div className="flex gap-2">
              <button onClick={() => cambiarEstado(m.id, m.estado)} className="flex-1 bg-gray-800 text-white text-sm py-2 rounded-lg hover:bg-gray-700 transition">
                Cambiar a {nextEstado[m.estado]}
              </button>
              <button onClick={() => openEdit(m)} className="text-blue-600 text-xs hover:underline">Editar</button>
              <button onClick={() => handleDelete(m.id)} className="text-red-500 text-xs hover:underline">Eliminar</button>
            </div>
          </div>
        ))}
        {mesas.length === 0 && (
          <p className="col-span-full text-center text-gray-400 py-8">No hay mesas registradas</p>
        )}
      </div>
    </div>
  );
}
