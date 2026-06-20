"use client";

import { useEffect, useState } from "react";
import { Receipt, Check, Loader2, AlertCircle, CreditCard, Banknote } from "lucide-react";

interface Plato {
  id: number;
  nombre: string;
  precio: number;
}

interface Pedido {
  id: number;
  estado: string;
  total: number;
  platos: Plato[];
}

interface Mesa {
  id: number;
  numero: number;
  estado: string;
}

interface Ticket {
  id: number;
  total: number;
  metodoPago: string | null;
  estado: string;
  mesaId: number;
  mesa: Mesa;
  pedidos: Pedido[];
  createdAt: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMesa, setSelectedMesa] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchTicketsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ticketsRes, mesasRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/tickets`).then((r) => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/mesas`).then((r) => r.json()),
      ]);
      setTickets(ticketsRes);
      setMesas(mesasRes);
    } catch {
      setError("No se pudo conectar con el servidor backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketsData();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
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

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mesaId: mesaIdNum }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al generar ticket");
      }

      setSuccessMsg("¡Ticket de cuenta generado con éxito!");
      setSelectedMesa("");
      fetchTicketsData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "No se pudo generar el ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePagarTicket = async (id: number, metodoPago: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/tickets/${id}/pagar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodoPago }),
      });
      if (!res.ok) throw new Error("Error al pagar ticket");
      fetchTicketsData();
    } catch {
      alert("No se pudo procesar el pago del ticket.");
    }
  };

  const getStatusClass = (estado: string) => {
    switch (estado) {
      case "abierto":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "pagado":
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
          <Receipt className="h-8 w-8 text-emerald-400" />
          Caja &amp; Facturación
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Genera tickets de cobro para mesas y registra los pagos recibidos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-bold text-white mb-4">Generar Cuenta de Mesa</h2>

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

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Mesa a Facturar
              </label>
              <select
                value={selectedMesa}
                onChange={(e) => setSelectedMesa(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Selecciona una mesa...</option>
                {mesas.map((m) => (
                  <option key={m.id} value={m.id}>
                    Mesa #{m.numero} ({m.estado})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2 text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generando...
                </>
              ) : (
                "Generar Ticket"
              )}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Tickets Registrados</h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-slate-500">{error}</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No hay tickets emitidos.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`border rounded-xl p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 ${getStatusClass(ticket.estado)}`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono text-slate-500">Ticket #{ticket.id}</span>
                      <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-black/25">
                        {ticket.estado}
                      </span>
                    </div>

                    <h3 className="text-md font-bold text-white mt-2">Mesa #{ticket.mesa?.numero}</h3>

                    <div className="mt-3">
                      <span className="text-xs text-slate-400 uppercase font-semibold">Pedidos Facturados:</span>
                      <div className="space-y-2 mt-1.5">
                        {ticket.pedidos?.map((pedido, idx) => (
                          <div key={idx} className="bg-black/15 p-2 rounded text-xs border border-slate-800/40">
                            <div className="flex justify-between font-bold text-slate-300">
                              <span>Pedido #{pedido.id}</span>
                              <span className="font-mono text-emerald-400">S/. {Number(pedido.total).toFixed(2)}</span>
                            </div>
                            <ul className="list-disc list-inside text-slate-400 mt-1 pl-1 space-y-0.5">
                              {pedido.platos?.map((plato, pIdx) => (
                                <li key={pIdx}>{plato.nombre}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center border-t border-slate-800/40 pt-3">
                      <span className="text-sm text-slate-400 font-bold">Total Cuenta:</span>
                      <span className="text-lg font-black text-emerald-400 font-mono">
                        S/. {Number(ticket.total).toFixed(2)}
                      </span>
                    </div>

                    {ticket.metodoPago && (
                      <div className="mt-2 text-xs text-slate-400">
                        Pago: <span className="capitalize font-semibold text-white">{ticket.metodoPago}</span>
                      </div>
                    )}
                  </div>

                  {ticket.estado === "abierto" && (
                    <div className="mt-5 pt-4 border-t border-slate-800/40 flex gap-2">
                      <button
                        onClick={() => handlePagarTicket(ticket.id, "efectivo")}
                        className="flex-1 text-xs py-1.5 px-2 rounded font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        <Banknote className="h-3.5 w-3.5" /> Efectivo
                      </button>
                      <button
                        onClick={() => handlePagarTicket(ticket.id, "tarjeta")}
                        className="flex-1 text-xs py-1.5 px-2 rounded font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="h-3.5 w-3.5" /> Tarjeta
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
