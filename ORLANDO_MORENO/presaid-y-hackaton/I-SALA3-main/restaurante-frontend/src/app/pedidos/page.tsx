"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Plus, Check, Loader2, AlertCircle, Trash2 } from "lucide-react";

interface Plato {
  id: number;
  nombre: string;
  precio: number;
  disponible: boolean;
}

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: string;
}

interface Pedido {
  id: number;
  estado: string;
  total: number;
  mesaId: number;
  mesa: Mesa;
  platos: Plato[];
  createdAt: string;
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedMesa, setSelectedMesa] = useState("");
  const [selectedPlatos, setSelectedPlatos] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pedidosRes, mesasRes, platosRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/pedidos`).then((r) => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/mesas`).then((r) => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/platos`).then((r) => r.json()),
      ]);

      setPedidos(pedidosRes);
      // Filtramos las mesas disponibles o la mesa del pedido
      setMesas(mesasRes);
      // Filtramos solo los platos disponibles
      setPlatos(platosRes.filter((p: Plato) => p.disponible));
    } catch (err) {
      setError("No se pudo conectar con el servidor backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePedido = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setSuccessMsg(null);

    const mesaIdNum = parseInt(selectedMesa);
    if (isNaN(mesaIdNum)) {
      setFormError("Por favor selecciona una mesa válida.");
      setSubmitting(false);
      return;
    }

    if (selectedPlatos.length === 0) {
      setFormError("Por favor selecciona al menos un plato.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/pedidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mesaId: mesaIdNum,
          platoIds: selectedPlatos,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al crear el pedido");
      }

      setSuccessMsg("¡Pedido creado con éxito!");
      setSelectedMesa("");
      setSelectedPlatos([]);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || "No se pudo crear el pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePlatoSelection = (id: number) => {
    if (selectedPlatos.includes(id)) {
      setSelectedPlatos(selectedPlatos.filter((pid) => pid !== id));
    } else {
      setSelectedPlatos([...selectedPlatos, id]);
    }
  };

  const handleDeletePedido = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este pedido?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/pedidos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar pedido");
      fetchData();
    } catch (err) {
      alert("No se pudo eliminar el pedido.");
    }
  };

  const handleUpdateEstado = async (id: number, nuevoEstado: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/pedidos/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error("Error al cambiar estado del pedido");
      fetchData();
    } catch (err) {
      alert("No se pudo cambiar el estado del pedido.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-amber-400" />
          Pedidos Activos
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Registra nuevas órdenes y controla el estado de las cuentas del salón.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-amber-400" /> Nuevo Pedido
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

          <form onSubmit={handleCreatePedido} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Mesa</label>
              <select
                value={selectedMesa}
                onChange={(e) => setSelectedMesa(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">Selecciona una mesa...</option>
                {mesas.map((m) => (
                  <option key={m.id} value={m.id}>
                    Mesa #{m.numero} (Cap: {m.capacidad} - {m.estado})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Platos (Selecciona varios)</label>
              {platos.length === 0 ? (
                <div className="text-xs text-slate-500">No hay platos disponibles en la carta.</div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {platos.map((plato) => (
                    <label key={plato.id} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={selectedPlatos.includes(plato.id)}
                        onChange={() => handleTogglePlatoSelection(plato.id)}
                        className="rounded text-amber-500 bg-slate-900 border-slate-800 focus:ring-amber-500 focus:ring-offset-slate-950 w-4 h-4"
                      />
                      <span>{plato.nombre} - <span className="font-mono text-emerald-400">S/. {Number(plato.precio).toFixed(2)}</span></span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white rounded-lg py-2 text-sm font-bold shadow-md hover:shadow-amber-950/20 active:translate-y-px transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Crear Pedido"
              )}
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Órdenes Activas</h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-slate-500">{error}</div>
          ) : pedidos.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No hay pedidos activos. Crea uno a la izquierda.</div>
          ) : (
            <div className="space-y-4">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-slate-500">#{pedido.id}</span>
                      <h3 className="text-md font-bold text-white">Mesa #{pedido.mesa?.numero}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider font-semibold">
                        {pedido.estado}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Detalle del Consumo:</span>
                      <ul className="text-sm text-slate-300 list-disc list-inside mt-1 ml-1 space-y-0.5">
                        {pedido.platos.map((plato, index) => (
                          <li key={index}>
                            {plato.nombre} - <span className="font-mono text-emerald-400">S/. {Number(plato.precio).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-2 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block uppercase font-semibold">Total a pagar</span>
                      <span className="text-xl font-extrabold text-emerald-400 font-mono">S/. {Number(pedido.total).toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <select
                        value={pedido.estado}
                        onChange={(e) => handleUpdateEstado(pedido.id, e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-amber-500"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_preparacion">En Prep.</option>
                        <option value="listo">Listo</option>
                        <option value="entregado">Entregado</option>
                      </select>
                      <button
                        onClick={() => handleDeletePedido(pedido.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Eliminar Pedido"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
