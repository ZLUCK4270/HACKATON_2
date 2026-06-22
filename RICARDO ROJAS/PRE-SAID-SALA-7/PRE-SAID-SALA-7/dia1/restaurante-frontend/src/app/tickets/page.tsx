"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Mesa {
  id: number;
  numero: number;
}

interface Pedido {
  id: number;
  platos: { nombre: string }[];
  total: string;
  estado: string;
}

interface Ticket {
  id: number;
  mesaId: number;
  mesa: Mesa;
  total: string;
  metodoPago: string | null;
  estado: string;
  createdAt: string;
}

const estadoBadge: Record<string, string> = {
  abierto: "bg-blue-100 text-blue-700",
  pagado: "bg-green-100 text-green-700",
};

const normalizeEstado = (e: string) => e.toLowerCase();
const badgeClass = (estado: string) => {
  const normal = normalizeEstado(estado);
  return estadoBadge[normal] || "bg-gray-100 text-gray-600";
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [mesaId, setMesaId] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [pedidosMap, setPedidosMap] = useState<Record<number, Pedido[]>>({});
  const [paying, setPaying] = useState<number | null>(null);
  const [metodoPago, setMetodoPago] = useState("efectivo");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const [tickRes, mesRes] = await Promise.all([
        fetch(`${API}/tickets`),
        fetch(`${API}/mesas`),
      ]);
      if (!tickRes.ok || !mesRes.ok) throw new Error("Error al obtener datos");
      setTickets(await tickRes.json());
      setMesas(await mesRes.json());
    } catch (e) {
      setError(`No se pudieron cargar los tickets: ${e instanceof Error ? e.message : "verificá que el backend esté corriendo"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesaId) return;
    setError("");
    try {
      const res = await fetch(`${API}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mesaId: Number(mesaId) }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Error del servidor");
      }
      setMesaId("");
      setShowForm(false);
      await fetchTickets();
    } catch (e) {
      setError(`No se pudo crear el ticket: ${e instanceof Error ? e.message : "la mesa debe tener al menos un pedido"}`);
    }
  };

  const handlePagar = async (id: number) => {
    setError("");
    try {
      const res = await fetch(`${API}/tickets/${id}/pagar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodoPago }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Error del servidor");
      }
      setPaying(null);
      setExpanded(null);
      await fetchTickets();
    } catch (e) {
      setError(`No se pudo procesar el pago: ${e instanceof Error ? e.message : "error desconocido"}`);
    }
  };

  const toggleExpand = async (ticket: Ticket) => {
    if (expanded === ticket.id) {
      setExpanded(null);
      return;
    }
    setError("");
    try {
      const res = await fetch(`${API}/tickets/${ticket.id}`);
      if (!res.ok) throw new Error("Error al obtener detalle");
      const data = await res.json();
      setPedidosMap((prev) => ({ ...prev, [ticket.id]: data.pedidos }));
      setExpanded(ticket.id);
    } catch (e) {
      setError(`No se pudieron cargar los detalles: ${e instanceof Error ? e.message : "error desconocido"}`);
    }
  };

  if (loading) return <p className="text-gray-500">Cargando tickets...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition"
        >
          {showForm ? "Cancelar" : "+ Nuevo Ticket"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
          {error}
          <button onClick={() => setError("")} className="float-right font-bold">&times;</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <select
            value={mesaId}
            onChange={(e) => setMesaId(e.target.value)}
            required
            className="border rounded-lg px-3 py-2 text-sm flex-1"
          >
            <option value="">Seleccionar mesa...</option>
            {mesas.map((m) => (
              <option key={m.id} value={m.id}>Mesa #{m.numero}</option>
            ))}
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
            Generar Ticket
          </button>
        </form>
      )}

      <div className="space-y-3">
        {tickets.map((t) => (
          <div key={t.id} className="bg-white rounded-xl shadow">
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
              onClick={() => toggleExpand(t)}
            >
              <div className="flex items-center gap-4">
                <h3 className="font-semibold">Ticket #{t.id}</h3>
                <span className="text-sm text-gray-500">Mesa #{t.mesa?.numero ?? t.mesaId}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass(t.estado)}`}>
                  {t.estado}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">${Number(t.total).toFixed(2)}</span>
                {t.metodoPago && <span className="text-xs text-gray-400">({t.metodoPago})</span>}
                <span className="text-gray-400 text-sm">{expanded === t.id ? "▲" : "▼"}</span>
              </div>
            </div>

            {expanded === t.id && (
              <div className="border-t px-4 py-3 bg-gray-50 rounded-b-xl">
                <h4 className="text-sm font-semibold mb-2">Pedidos de la mesa:</h4>
                {pedidosMap[t.id]?.length ? (
                  <ul className="text-sm space-y-1">
                    {pedidosMap[t.id].map((p) => (
                      <li key={p.id} className="flex justify-between">
                        <span>Pedido #{p.id} — {p.platos.map((pl) => pl.nombre).join(", ")}</span>
                        <span className="font-medium">${Number(p.total).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">Cargando pedidos...</p>
                )}

                {t.estado === "abierto" && (
                  <div className="mt-3 border-t pt-3">
                    {paying === t.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={metodoPago}
                          onChange={(e) => setMetodoPago(e.target.value)}
                          className="border rounded-lg px-3 py-1.5 text-sm"
                        >
                          <option value="efectivo">Efectivo</option>
                          <option value="tarjeta">Tarjeta</option>
                        </select>
                        <button
                          onClick={() => handlePagar(t.id)}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition"
                        >
                          Confirmar Pago
                        </button>
                        <button
                          onClick={() => setPaying(null)}
                          className="text-sm text-gray-500 hover:underline"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPaying(t.id)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition"
                      >
                        Pagar
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {tickets.length === 0 && (
          <p className="text-center text-gray-400 py-8">No hay tickets generados</p>
        )}
      </div>
    </div>
  );
}
