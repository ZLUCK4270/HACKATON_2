"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Plato {
  id: number;
  nombre: string;
  precio: string;
  disponible: boolean;
}

export default function PlatosPage() {
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [disponible, setDisponible] = useState(true);

  const fetchPlatos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/platos`);
      if (!res.ok) throw new Error();
      setPlatos(await res.json());
    } catch {
      setError("No se pudieron cargar los platos. Verificá que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlatos(); }, []);

  const resetForm = () => {
    setNombre("");
    setPrecio("");
    setDisponible(true);
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (p: Plato) => {
    setNombre(p.nombre);
    setPrecio(p.precio);
    setDisponible(p.disponible);
    setEditId(p.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = { nombre, precio: parseFloat(precio), disponible };
      const res = editId
        ? await fetch(`${API}/platos/${editId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`${API}/platos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      if (!res.ok) throw new Error();
      resetForm();
      await fetchPlatos();
    } catch {
      setError(editId ? "No se pudo actualizar el plato." : "No se pudo crear el plato.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este plato?")) return;
    try {
      const res = await fetch(`${API}/platos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await fetchPlatos();
    } catch {
      setError("No se pudo eliminar el plato.");
    }
  };

  if (loading) return <p className="text-gray-500">Cargando platos...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Platos</h1>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition"
        >
          {showForm ? "Cancelar" : "+ Nuevo Plato"}
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
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-gray-500 mb-1">Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="w-28">
            <label className="block text-xs text-gray-500 mb-1">Precio</label>
            <input value={precio} onChange={(e) => setPrecio(e.target.value)} type="number" step="0.01" required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm pb-1">
            <input type="checkbox" checked={disponible} onChange={(e) => setDisponible(e.target.checked)} />
            Disponible
          </label>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
            {editId ? "Actualizar" : "Guardar"}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="text-sm text-gray-500 hover:underline">Cancelar edición</button>
          )}
        </form>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Disponible</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {platos.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{p.id}</td>
                <td className="px-4 py-3">{p.nombre}</td>
                <td className="px-4 py-3">${Number(p.precio).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${p.disponible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {p.disponible ? "Sí" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-blue-600 text-xs hover:underline">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 text-xs hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
            {platos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No hay platos registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
