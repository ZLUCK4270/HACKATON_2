"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
interface Plato {
  id: number;
  nombre: string;
  precio: number;
  disponible: boolean;
}

export default function PlatosPage() {
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [disponible, setDisponible] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Platos
  const fetchPlatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get("/platos");
      if (!res.ok) throw new Error("Error en la respuesta del servidor");
      const data = await res.json();
      // Sort by name or id
      setPlatos(data.sort((a: Plato, b: Plato) => a.id - b.id));
    } catch {
      setError("No se pudo conectar con el servidor para listar los platos. Por favor, verifica el backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatos();
  }, []);

  // Handle Create Plato
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!nombre.trim()) {
      setFormError("El nombre del plato es requerido.");
      return;
    }

    const priceNum = parseFloat(precio);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError("El precio debe ser un número positivo.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiClient.post("/platos", {
        nombre: nombre.trim(),
        precio: priceNum,
        disponible,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al crear el plato.");
      }

      setNombre("");
      setPrecio("");
      setDisponible(true);
      setFormSuccess(true);
      fetchPlatos(); // Reload list
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo crear el plato. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Availability (Extra premium touch)
  const toggleDisponibilidad = async (plato: Plato) => {
    try {
      const res = await apiClient.patch(`/platos/${plato.id}`, {
        disponible: !plato.disponible,
      });

      if (!res.ok) throw new Error("No se pudo actualizar la disponibilidad.");
      
      // Update local state directly for responsive feedback
      setPlatos(prev =>
        prev.map(p => (p.id === plato.id ? { ...p, disponible: !p.disponible } : p))
      );
    } catch (err) {
      alert("Error al actualizar plato: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent sm:text-4xl">
          Menú de Platos
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Agrega nuevos platos y controla su disponibilidad en tiempo real para las comandas.
        </p>
      </div>

      {error && (
        <div className="p-4 border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 rounded-2xl flex gap-3 items-center text-amber-800 dark:text-amber-200">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Platos Table List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-bold text-slate-800 dark:text-white">Platos Registrados</h3>
            <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full font-bold text-slate-500 dark:text-slate-400">
              {platos.length} platos
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium">
              Cargando platos...
            </div>
          ) : platos.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500">
              No hay platos registrados. ¡Agrega el primero desde el formulario lateral!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 text-xs font-semibold text-slate-400 uppercase">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Precio</th>
                    <th className="px-6 py-4">Disponibilidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                  {platos.map((plato) => (
                    <tr
                      key={plato.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-slate-400">{plato.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                        {plato.nombre}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        ${Number(plato.precio).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleDisponibilidad(plato)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                            plato.disponible
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              plato.disponible ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          ></span>
                          {plato.disponible ? "Disponible" : "No Disponible"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Plato Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Nuevo Plato</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Agrega una nueva opción al menú para ser seleccionada en pedidos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form feedback */}
            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-medium">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs font-medium flex items-center gap-1.5">
                <span>✓</span> Plato creado con éxito.
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Nombre del Plato
              </label>
              <input
                type="text"
                placeholder="Ej. Hamburguesa Gourmet"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Precio (USD)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Ej. 12.50"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="disponible"
                checked={disponible}
                onChange={(e) => setDisponible(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-200 dark:border-slate-800 rounded focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950"
              />
              <label
                htmlFor="disponible"
                className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none cursor-pointer"
              >
                Habilitar disponibilidad inmediata
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-md shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 dark:hover:shadow-none transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                "Guardando..."
              ) : (
                <>
                  <span>Crear Plato</span>
                  <span className="text-xs font-normal opacity-80">(Guardar)</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
