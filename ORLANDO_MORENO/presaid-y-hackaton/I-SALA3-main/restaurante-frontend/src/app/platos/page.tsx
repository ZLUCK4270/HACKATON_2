"use client";

import { useEffect, useState } from "react";
import { Utensils, Plus, Check, X, Loader2, AlertCircle } from "lucide-react";

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
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchPlatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/platos`);
      if (!res.ok) throw new Error("Error al obtener platos");
      const data = await res.json();
      setPlatos(data);
    } catch (err: any) {
      setError("No se pudo conectar con el servidor backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setSuccessMsg(null);

    const priceNum = parseFloat(precio);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError("El precio debe ser un número positivo.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/platos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          precio: priceNum,
          disponible,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al crear plato");
      }

      setSuccessMsg("¡Plato creado con éxito!");
      setNombre("");
      setPrecio("");
      setDisponible(true);
      fetchPlatos(); // refresh list
    } catch (err: any) {
      setFormError(err.message || "No se pudo crear el plato.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleDisponible = async (plato: Plato) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/platos/${plato.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          disponible: !plato.disponible,
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar plato");
      fetchPlatos();
    } catch (err) {
      alert("No se pudo actualizar el estado del plato.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight flex items-center gap-3">
          <Utensils className="h-8 w-8 text-indigo-400" />
          Carta de Platos
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Visualiza, actualiza e ingresa nuevos platos al menú del restaurante.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-400" /> Nuevo Plato
          </h2>

          {formError && (
            <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-3 text-red-300 text-xs mb-4 flex gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 text-emerald-300 text-xs mb-4 flex gap-2">
              <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Ej. Lomo Saltado"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Precio (S/.)</label>
              <input
                type="number"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Ej. 35.50"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="disponible"
                checked={disponible}
                onChange={(e) => setDisponible(e.target.checked)}
                className="rounded text-indigo-500 bg-slate-950 border-slate-800 focus:ring-indigo-500 focus:ring-offset-slate-900 w-4 h-4"
              />
              <label htmlFor="disponible" className="text-sm font-medium text-slate-300 cursor-pointer">Disponible al público</label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2 text-sm font-bold shadow-md hover:shadow-indigo-950/20 active:translate-y-px transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Guardar Plato"
              )}
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Platos Registrados</h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-slate-500">{error}</div>
          ) : platos.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No hay platos registrados. Crea uno a la izquierda.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Precio</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-transparent">
                  {platos.map((plato) => (
                    <tr key={plato.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-500 font-mono">#{plato.id}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-white">{plato.nombre}</td>
                      <td className="px-4 py-3 text-sm text-slate-300 font-mono">S/. {Number(plato.precio).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">
                        {plato.disponible ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Disponible</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">No Disp.</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <button
                          onClick={() => handleToggleDisponible(plato)}
                          className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                            plato.disponible 
                              ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20" 
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {plato.disponible ? "Deshabilitar" : "Habilitar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
