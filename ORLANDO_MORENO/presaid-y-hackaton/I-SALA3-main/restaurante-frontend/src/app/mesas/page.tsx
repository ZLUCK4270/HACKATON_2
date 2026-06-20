"use client";

import { useEffect, useState } from "react";
import { Layers, Plus, Check, Loader2, AlertCircle } from "lucide-react";

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: string;
}

export default function MesasPage() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State para nueva mesa
  const [numero, setNumero] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchMesas = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/mesas`);
      if (!res.ok) throw new Error("Error al obtener mesas");
      const data = await res.json();
      setMesas(data.sort((a: Mesa, b: Mesa) => a.numero - b.numero));
    } catch (err) {
      setError("No se pudo conectar con el servidor backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesas();
  }, []);

  const handleCreateMesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setSuccessMsg(null);

    const numVal = parseInt(numero);
    const capVal = parseInt(capacidad);

    if (isNaN(numVal) || numVal <= 0 || isNaN(capVal) || capVal <= 0) {
      setFormError("Número y capacidad deben ser enteros positivos.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/mesas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numero: numVal,
          capacidad: capVal,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al crear mesa");
      }

      setSuccessMsg("¡Mesa creada con éxito!");
      setNumero("");
      setCapacidad("");
      fetchMesas();
    } catch (err: any) {
      setFormError(err.message || "No se pudo crear la mesa.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/mesas/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) throw new Error("Error al cambiar estado");
      fetchMesas();
    } catch (err) {
      alert("No se pudo cambiar el estado de la mesa.");
    }
  };

  const getStatusClass = (estado: string) => {
    switch (estado) {
      case "disponible":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "ocupada":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      case "reservada":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      default:
        return "bg-slate-500/10 border-slate-500/30 text-slate-400";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight flex items-center gap-3">
          <Layers className="h-8 w-8 text-cyan-400" />
          Control de Mesas
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Supervisa la ocupación, agrega nuevas mesas y actualiza estados de atención.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-cyan-400" /> Nueva Mesa
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

          <form onSubmit={handleCreateMesa} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Número de Mesa</label>
              <input
                type="number"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="Ej. 5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Capacidad (Personas)</label>
              <input
                type="number"
                value={capacidad}
                onChange={(e) => setCapacidad(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="Ej. 4"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg py-2 text-sm font-bold shadow-md hover:shadow-cyan-950/20 active:translate-y-px transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Guardar Mesa"
              )}
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Distribución del Salón</h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-slate-500">{error}</div>
          ) : mesas.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No hay mesas registradas. Crea una a la izquierda.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mesas.map((mesa) => (
                <div
                  key={mesa.id}
                  className={`border rounded-xl p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 ${getStatusClass(
                    mesa.estado
                  )}`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-white">Mesa #{mesa.numero}</h3>
                      <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-black/25">
                        {mesa.estado}
                      </span>
                    </div>
                    <p className="text-sm mt-2 text-slate-300">
                      Capacidad: <strong className="text-white">{mesa.capacidad} personas</strong>
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/40 flex gap-2">
                    <button
                      onClick={() => handleCambiarEstado(mesa.id, "disponible")}
                      disabled={mesa.estado === "disponible"}
                      className="flex-1 text-xs py-1 px-2 rounded font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all"
                    >
                      Disponible
                    </button>
                    <button
                      onClick={() => handleCambiarEstado(mesa.id, "ocupada")}
                      disabled={mesa.estado === "ocupada"}
                      className="flex-1 text-xs py-1 px-2 rounded font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all"
                    >
                      Ocupar
                    </button>
                    <button
                      onClick={() => handleCambiarEstado(mesa.id, "reservada")}
                      disabled={mesa.estado === "reservada"}
                      className="flex-1 text-xs py-1 px-2 rounded font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all"
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
