"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
enum EstadoMesa {
  DISPONIBLE = "disponible",
  OCUPADA = "ocupada",
  RESERVADA = "reservada",
}

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: EstadoMesa;
}

export default function MesasPage() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [numero, setNumero] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Mesas
  const fetchMesas = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get("/mesas");
      if (!res.ok) throw new Error("Error en la respuesta del servidor");
      const data = await res.json();
      // Sort by table number
      setMesas(data.sort((a: Mesa, b: Mesa) => a.numero - b.numero));
    } catch {
      setError("No se pudo conectar con el servidor para listar las mesas. Por favor, verifica el backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesas();
  }, []);

  // Update Mesa State
  const cambiarEstado = async (id: number, nuevoEstado: EstadoMesa) => {
    try {
      const res = await apiClient.patch(`/mesas/${id}/estado`, {
        estado: nuevoEstado,
      });

      if (!res.ok) throw new Error("No se pudo actualizar el estado de la mesa.");

      // Update local state directly
      setMesas(prev =>
        prev.map(m => (m.id === id ? { ...m, estado: nuevoEstado } : m))
      );
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Create New Mesa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    const numMesa = parseInt(numero);
    const capMesa = parseInt(capacidad);

    if (isNaN(numMesa) || numMesa <= 0) {
      setFormError("El número de mesa debe ser un entero positivo.");
      return;
    }

    if (isNaN(capMesa) || capMesa <= 0) {
      setFormError("La capacidad de la mesa debe ser un entero positivo.");
      return;
    }

    // Check if table number is already used locally
    if (mesas.some((m) => m.numero === numMesa)) {
      setFormError(`La mesa número ${numMesa} ya está registrada.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiClient.post("/mesas", {
        numero: numMesa,
        capacidad: capMesa,
        estado: EstadoMesa.DISPONIBLE,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al crear la mesa.");
      }

      setNumero("");
      setCapacidad("");
      setFormSuccess(true);
      fetchMesas(); // Reload list
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo crear la mesa. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpers for styling
  const getEstadoStyles = (estado: EstadoMesa) => {
    switch (estado) {
      case EstadoMesa.DISPONIBLE:
        return "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-400";
      case EstadoMesa.OCUPADA:
        return "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-400";
      case EstadoMesa.RESERVADA:
        return "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-400";
      default:
        return "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent sm:text-4xl">
          Distribución de Mesas
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Monitorea y actualiza el estado actual de las mesas del restaurante o registra nuevas ubicaciones.
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Mesas Grid list */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium">
              Cargando mesas...
            </div>
          ) : mesas.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500">
              No hay mesas registradas. ¡Agrega la primera mesa usando el formulario!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mesas.map((mesa) => (
                <div
                  key={mesa.id}
                  className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border transition-all duration-300 hover:shadow-md flex flex-col justify-between ${
                    mesa.estado === EstadoMesa.DISPONIBLE
                      ? "border-emerald-100 hover:border-emerald-300 dark:border-slate-800 dark:hover:border-emerald-900"
                      : mesa.estado === EstadoMesa.OCUPADA
                      ? "border-rose-100 hover:border-rose-300 dark:border-slate-800 dark:hover:border-rose-900"
                      : "border-amber-100 hover:border-amber-300 dark:border-slate-800 dark:hover:border-amber-900"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-2xl font-black text-slate-800 dark:text-white">
                          Mesa {mesa.numero}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Capacidad: <span className="font-bold text-slate-600 dark:text-slate-300">{mesa.capacidad} personas</span>
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getEstadoStyles(
                          mesa.estado
                        )}`}
                      >
                        {mesa.estado}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          mesa.estado === EstadoMesa.DISPONIBLE
                            ? "w-full bg-emerald-500"
                            : mesa.estado === EstadoMesa.OCUPADA
                            ? "w-full bg-rose-500"
                            : "w-1/2 bg-amber-500"
                        }`}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                      Cambiar Estado
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {Object.values(EstadoMesa).map((estado) => (
                        <button
                          key={estado}
                          onClick={() => cambiarEstado(mesa.id, estado)}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-extrabold capitalize border transition-all text-center ${
                            mesa.estado === estado
                              ? "bg-slate-900 text-white border-transparent dark:bg-white dark:text-slate-950 font-black shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          {estado}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Mesa Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Nueva Mesa</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Registra una nueva mesa en la sala para asignar comandas.
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
                <span>✓</span> Mesa registrada con éxito.
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Número de Mesa
              </label>
              <input
                type="number"
                placeholder="Ej. 5"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Capacidad (Comensales)
              </label>
              <input
                type="number"
                placeholder="Ej. 4"
                value={capacidad}
                onChange={(e) => setCapacidad(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-md shadow-emerald-200 dark:shadow-none hover:shadow-emerald-300 dark:hover:shadow-none transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                "Guardando..."
              ) : (
                <>
                  <span>Registrar Mesa</span>
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
