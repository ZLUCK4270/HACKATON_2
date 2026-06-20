"use client";

import { useEffect, useState } from "react";
import { ChefHat, Check, Loader2, AlertCircle, Play, CheckCircle2 } from "lucide-react";

interface Plato {
  id: number;
  nombre: string;
  precio: number;
}

interface Mesa {
  id: number;
  numero: number;
}

interface Pedido {
  id: number;
  estado: string;
  total: number;
  mesa: Mesa;
  platos: Plato[];
}

interface Comanda {
  id: number;
  estado: string;
  observaciones: string;
  pedidoId: number;
  pedido: Pedido;
  createdAt: string;
}

export default function ComandasPage() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedPedido, setSelectedPedido] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchCocinaData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [comandasRes, pedidosRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/comandas`).then((r) => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/pedidos`).then((r) => r.json()),
      ]);

      setComandas(comandasRes);
      // Filtramos pedidos para sugerir solo los que están "pendiente" y no tienen comanda ya creada
      const comandasPedidoIds = comandasRes.map((c: Comanda) => c.pedidoId);
      setPedidos(pedidosRes.filter((p: Pedido) => !comandasPedidoIds.includes(p.id)));
    } catch (err) {
      setError("No se pudo conectar con el servidor backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCocinaData();
  }, []);

  const handleCreateComanda = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setSuccessMsg(null);

    const pedidoIdNum = parseInt(selectedPedido);
    if (isNaN(pedidoIdNum)) {
      setFormError("Por favor selecciona un pedido válido.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/comandas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pedidoId: pedidoIdNum,
          observaciones,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al enviar a cocina");
      }

      setSuccessMsg("¡Pedido enviado a cocina (Comanda creada)!");
      setSelectedPedido("");
      setObservaciones("");
      fetchCocinaData();
    } catch (err: any) {
      setFormError(err.message || "No se pudo crear la comanda.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/comandas/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) throw new Error("Error al actualizar estado");
      fetchCocinaData();
    } catch (err) {
      alert("No se pudo cambiar el estado de la comanda.");
    }
  };

  const getStatusClass = (estado: string) => {
    switch (estado) {
      case "recibida":
        return "bg-indigo-500/10 border-indigo-500/30 text-indigo-400";
      case "en_preparacion":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "lista":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      default:
        return "bg-slate-500/10 border-slate-500/30 text-slate-400";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-rose-400" />
          Cocina (Comandas)
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Monitorea y procesa las comandas del salón. Actualiza a "En preparación" y "Listo".
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-bold text-white mb-4">Enviar Pedido a Cocina</h2>

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

          <form onSubmit={handleCreateComanda} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Pedido Pendiente</label>
              <select
                value={selectedPedido}
                onChange={(e) => setSelectedPedido(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="">Selecciona un pedido...</option>
                {pedidos.map((p) => (
                  <option key={p.id} value={p.id}>
                    Pedido #{p.id} - Mesa #{p.mesa?.numero} (S/. {Number(p.total).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Observaciones</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500 h-24 resize-none"
                placeholder="Ej. Sin cebolla, término medio, etc."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white rounded-lg py-2 text-sm font-bold shadow-md hover:shadow-rose-950/20 active:translate-y-px transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Procesando...
                </>
              ) : (
                "Enviar a Cocina"
              )}
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Comandas en Pantalla</h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-slate-500">{error}</div>
          ) : comandas.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No hay comandas en proceso.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comandas.map((comanda) => (
                <div
                  key={comanda.id}
                  className={`border rounded-xl p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 ${getStatusClass(
                    comanda.estado
                  )}`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono text-slate-500">Comanda #{comanda.id}</span>
                      <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-black/25">
                        {comanda.estado}
                      </span>
                    </div>

                    <h3 className="text-md font-bold text-white mt-2">Mesa #{comanda.pedido?.mesa?.numero}</h3>

                    <div className="mt-3">
                      <span className="text-xs text-slate-400 uppercase font-semibold">Platos:</span>
                      <ul className="text-sm text-slate-200 list-disc list-inside mt-1 space-y-0.5">
                        {comanda.pedido?.platos?.map((plato, idx) => (
                          <li key={idx}>{plato.nombre}</li>
                        ))}
                      </ul>
                    </div>

                    {comanda.observaciones && (
                      <div className="mt-3 p-2 bg-black/20 rounded border border-slate-800 text-xs text-amber-300">
                        <strong>Nota:</strong> {comanda.observaciones}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/40 flex gap-2">
                    <button
                      onClick={() => handleCambiarEstado(comanda.id, "en_preparacion")}
                      disabled={comanda.estado === "en_preparacion"}
                      className="flex-1 text-xs py-1.5 px-2 rounded font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <Play className="h-3 w-3" /> Cocinar
                    </button>
                    <button
                      onClick={() => handleCambiarEstado(comanda.id, "lista")}
                      disabled={comanda.estado === "lista"}
                      className="flex-1 text-xs py-1.5 px-2 rounded font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Listo
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
