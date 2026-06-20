"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
enum EstadoPedido {
  PENDIENTE = "pendiente",
  EN_PREPARACION = "en_preparacion",
  LISTO = "listo",
  ENTREGADO = "entregado",
}

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
  mesa: Mesa;
  platos: Plato[];
  estado: EstadoPedido;
  total: number;
  createdAt: string;
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedMesaId, setSelectedMesaId] = useState("");
  const [selectedPlatosCart, setSelectedPlatosCart] = useState<{ plato: Plato; cantidad: number }[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load All Data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pedidosRes, mesasRes, platosRes] = await Promise.all([
        apiClient.get("/pedidos"),
        apiClient.get("/mesas"),
        apiClient.get("/platos"),
      ]);

      if (!pedidosRes.ok || !mesasRes.ok || !platosRes.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const pedidosData: Pedido[] = await pedidosRes.json();
      const mesasData: Mesa[] = await mesasRes.json();
      const platosData: Plato[] = await platosRes.json();

      // Sort orders by id descending (newest first)
      setPedidos(pedidosData.sort((a, b) => b.id - a.id));
      setMesas(mesasData.sort((a, b) => a.numero - b.numero));
      setPlatos(platosData.filter(p => p.disponible)); // Only allow ordering available plates
    } catch {
      setError("No se pudo conectar con el servidor para obtener los datos de pedidos. Verifica el backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle status transitions
  const avanzarEstado = async (id: number, estadoActual: EstadoPedido) => {
    let proximoEstado: EstadoPedido;
    if (estadoActual === EstadoPedido.PENDIENTE) {
      proximoEstado = EstadoPedido.EN_PREPARACION;
    } else if (estadoActual === EstadoPedido.EN_PREPARACION) {
      proximoEstado = EstadoPedido.LISTO;
    } else if (estadoActual === EstadoPedido.LISTO) {
      proximoEstado = EstadoPedido.ENTREGADO;
    } else {
      return; // Already delivered
    }

    try {
      const res = await apiClient.patch(`/pedidos/${id}/estado`, {
        estado: proximoEstado,
      });

      if (!res.ok) throw new Error("No se pudo actualizar el estado de la comanda.");

      // Refresh data
      fetchData();
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Add to temporary cart builder
  const agregarAlCarrito = (plato: Plato) => {
    setSelectedPlatosCart(prev => {
      const existing = prev.find(item => item.plato.id === plato.id);
      if (existing) {
        return prev.map(item =>
          item.plato.id === plato.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { plato, cantidad: 1 }];
    });
  };

  // Remove from temporary cart builder
  const removerDelCarrito = (platoId: number) => {
    setSelectedPlatosCart(prev => prev.filter(item => item.plato.id !== platoId));
  };

  // Change count in cart
  const cambiarCantidad = (platoId: number, delta: number) => {
    setSelectedPlatosCart(prev =>
      prev
        .map(item => {
          if (item.plato.id === platoId) {
            const nuevaCantidad = item.cantidad + delta;
            return { ...item, cantidad: nuevaCantidad };
          }
          return item;
        })
        .filter(item => item.cantidad > 0)
    );
  };

  // Handle Submit Order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!selectedMesaId) {
      setFormError("Debes seleccionar una mesa.");
      return;
    }

    if (selectedPlatosCart.length === 0) {
      setFormError("Debes seleccionar al menos un plato.");
      return;
    }

    // Expand cart items into flat list of IDs for the backend
    const platoIds: number[] = [];
    selectedPlatosCart.forEach(item => {
      for (let i = 0; i < item.cantidad; i++) {
        platoIds.push(item.plato.id);
      }
    });

    try {
      setIsSubmitting(true);
      const res = await apiClient.post("/pedidos", {
        mesaId: parseInt(selectedMesaId),
        platoIds,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al registrar el pedido.");
      }

      setSelectedMesaId("");
      setSelectedPlatosCart([]);
      setFormSuccess(true);
      fetchData(); // Reload orders and tables
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo registrar la comanda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations
  const getCartTotal = () => {
    return selectedPlatosCart.reduce((acc, item) => acc + item.plato.precio * item.cantidad, 0);
  };

  // Helpers for styling
  const getEstadoBadgeStyle = (estado: EstadoPedido) => {
    switch (estado) {
      case EstadoPedido.PENDIENTE:
        return "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-400";
      case EstadoPedido.EN_PREPARACION:
        return "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-900/60 dark:text-blue-400";
      case EstadoPedido.LISTO:
        return "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-950/40 dark:border-violet-900/60 dark:text-violet-400";
      case EstadoPedido.ENTREGADO:
        return "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-400";
    }
  };

  const getAvanzarBotonText = (estado: EstadoPedido) => {
    switch (estado) {
      case EstadoPedido.PENDIENTE:
        return "Empezar Cocina 🍳";
      case EstadoPedido.EN_PREPARACION:
        return "Marcar Listo 🛎️";
      case EstadoPedido.LISTO:
        return "Entregar Mesa 🍽️";
      default:
        return "";
    }
  };

  // Aggregate duplicate plates inside a order for clean display
  const agruparPlatosPedido = (platosArray: Plato[]) => {
    const counts: { [key: number]: { plato: Plato; qty: number } } = {};
    platosArray.forEach(plato => {
      if (counts[plato.id]) {
        counts[plato.id].qty += 1;
      } else {
        counts[plato.id] = { plato, qty: 1 };
      }
    });
    return Object.values(counts);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent sm:text-4xl">
          Comandas y Pedidos
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Registra nuevos consumos o gestiona el flujo de trabajo de los pedidos activos desde cocina hasta caja.
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
        {/* Active Orders List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <span>Listado de Comandas</span>
            <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full font-bold text-slate-500">
              {pedidos.length} comandas
            </span>
          </h3>

          {loading ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium">
              Cargando comandas...
            </div>
          ) : pedidos.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500">
              No hay pedidos registrados. Genera uno usando el panel lateral.
            </div>
          ) : (
            <div className="space-y-4">
              {pedidos.map((pedido) => {
                const platosAgrupados = agruparPlatosPedido(pedido.platos);

                return (
                  <div
                    key={pedido.id}
                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between md:flex-row md:items-center gap-6 hover:shadow-md transition-shadow"
                  >
                    {/* Left: Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-lg font-black text-slate-800 dark:text-white">
                          Mesa {pedido.mesa?.numero ?? "S/N"}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">#{pedido.id}</span>
                        <span
                          className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getEstadoBadgeStyle(
                            pedido.estado
                          )}`}
                        >
                          {pedido.estado}
                        </span>
                      </div>

                      {/* Dishes List */}
                      <ul className="space-y-1">
                        {platosAgrupados.map((item) => (
                          <li
                            key={item.plato.id}
                            className="text-sm text-slate-600 dark:text-slate-300 flex items-center justify-between"
                          >
                            <span>
                              <span className="font-mono font-bold text-slate-400 dark:text-slate-500 mr-1">
                                {item.qty}x
                              </span>
                              {item.plato.nombre}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                              ${(item.plato.precio * item.qty).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="text-xs text-slate-400">
                        Creado: {new Date(pedido.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>

                    {/* Right: Actions and Total */}
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0 border-t pt-4 md:border-t-0 md:pt-0 border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                          Total Comanda
                        </p>
                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                          ${Number(pedido.total).toFixed(2)}
                        </p>
                      </div>

                      {pedido.estado !== EstadoPedido.ENTREGADO ? (
                        <button
                          onClick={() => avanzarEstado(pedido.id, pedido.estado)}
                          className="mt-4 md:mt-0 w-full md:w-auto px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-black rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                        >
                          {getAvanzarBotonText(pedido.estado)}
                        </button>
                      ) : (
                        <div className="text-xs text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1 mt-4 md:mt-0">
                          <span>✓</span> Entregado y Finalizado
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Order Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Nueva Comanda</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Selecciona una mesa y los platos correspondientes para iniciar el pedido.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-medium animate-shake">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs font-medium flex items-center gap-1.5">
                <span>✓</span> Pedido registrado con éxito en cocina.
              </div>
            )}

            {/* Select Mesa */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Seleccionar Mesa
              </label>
              <select
                value={selectedMesaId}
                onChange={(e) => setSelectedMesaId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              >
                <option value="">-- Elige una Mesa --</option>
                {mesas.map((m) => (
                  <option key={m.id} value={m.id}>
                    Mesa {m.numero} (Capacidad: {m.capacidad}p - {m.estado})
                  </option>
                ))}
              </select>
            </div>

            {/* Menu of Dishes */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Selecciona Platos
              </label>
              {platos.length === 0 ? (
                <p className="text-xs text-slate-400">No hay platos disponibles en el menú.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-950/20 divide-y divide-slate-100 dark:divide-slate-800/60">
                  {platos.map((plato) => (
                    <div
                      key={plato.id}
                      className="py-1.5 flex items-center justify-between text-xs hover:bg-slate-100/40 dark:hover:bg-slate-800/20 px-2 rounded-lg"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{plato.nombre}</span>
                        <span className="text-slate-400 ml-1.5 font-mono">${Number(plato.precio).toFixed(2)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => agregarAlCarrito(plato)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-extrabold rounded-lg transition-colors"
                      >
                        + Añadir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>


            {/* Cart Builder */}
            <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Comanda Actual (Carrito)
              </label>
              {selectedPlatosCart.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  Carrito vacío. Agrega platos arriba.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedPlatosCart.map((item) => (
                    <div
                      key={item.plato.id}
                      className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/40 text-xs"
                    >
                      <div className="flex-1 pr-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.plato.nombre}
                        </span>
                        <span className="text-slate-400 block font-mono">
                          ${(item.plato.precio * item.cantidad).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(item.plato.id, -1)}
                            className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {item.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(item.plato.id, 1)}
                            className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removerDelCarrito(item.plato.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                          title="Eliminar plato"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Calculation */}
            {selectedPlatosCart.length > 0 && (
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4 text-sm font-bold">
                <span className="text-slate-400">Total Estimado</span>
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  ${getCartTotal().toFixed(2)}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || selectedPlatosCart.length === 0 || !selectedMesaId}
              className="w-full py-3 bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-50 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold rounded-xl shadow-md transition-all disabled:opacity-40 text-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                "Enviando comanda..."
              ) : (
                <>
                  <span>Enviar a Cocina</span>
                  <span className="text-xs font-normal opacity-85">(Confirmar)</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
