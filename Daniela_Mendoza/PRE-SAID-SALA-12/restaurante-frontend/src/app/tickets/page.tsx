"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [metodosPago, setMetodosPago] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        cargarTickets();
    }, []);

    const cargarTickets = async () => {
        try {
            const res = await fetch(`${API_URL}/tickets`);
            const data = await res.json();
            setTickets(data);
        } catch (error) {
            console.error(error);
        }
    };

    const actualizarMetodo = (ticketId: number, metodo: string) => {
        setMetodosPago((prev) => ({
            ...prev,
            [ticketId]: metodo,
        }));
    };

    const pagarTicket = async (ticketId: number) => {
        const metodo = metodosPago[ticketId];

        if (!metodo) {
            alert("Selecciona un método de pago");
            return;
        }

        try {
            const res = await fetch(
                `${API_URL}/tickets/${ticketId}/pagar`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        metodoPago: metodo,
                    }),
                }
            );

            if (!res.ok) {
                throw new Error("Error al pagar");
            }

            alert("Ticket pagado correctamente");
            cargarTickets();
        } catch (error) {
            console.error(error);
            alert("Error al procesar pago");
        }
    };

    return (
        <main className="min-h-screen bg-black text-amber-50 p-8">
            <h1 className="text-4xl font-bold mb-8">
                💳 Tickets
            </h1>

            {tickets.length === 0 ? (
                <p>No hay tickets registrados</p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="bg-[#F5F0E6] text-black rounded-xl p-5 shadow-lg"
                        >
                            <h2 className="text-xl font-bold mb-2">
                                Ticket #{ticket.id}
                            </h2>

                            <p>
                                <strong>Mesa:</strong>{" "}
                                {ticket.mesa?.numero || ticket.mesa?.id}
                            </p>

                            <p>
                                <strong>Total:</strong> S/ {ticket.total}
                            </p>

                            <p>
                                <strong>Estado:</strong>{" "}
                                {ticket.estado}
                            </p>

                            {ticket.estado !== "pagado" && (
                                <>
                                    <select
                                        className="w-full border rounded p-2 mt-3"
                                        value={metodosPago[ticket.id] || ""}
                                        onChange={(e) =>
                                            actualizarMetodo(
                                                ticket.id,
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Seleccionar método
                                        </option>

                                        <option value="efectivo">
                                            💵 Efectivo
                                        </option>

                                        <option value="tarjeta">
                                            💳 Tarjeta
                                        </option>
                                    </select>

                                    <button
                                        onClick={() => pagarTicket(ticket.id)}
                                        className="w-full mt-3 bg-green-700 text-white py-2 rounded-lg"
                                    >
                                        Pagar
                                    </button>
                                </>
                            )}

                            {ticket.estado === "pagado" && (
                                <p className="text-green-700 font-bold mt-3">
                                    ✔ Ticket pagado
                                </p>
                            )}

                            <div className="mt-4">
                                <h3 className="font-bold">
                                    Pedidos:
                                </h3>

                                <ul className="list-disc pl-5">
                                    {ticket.pedidos?.map((pedido: any) => (
                                        <li key={pedido.id}>
                                            Pedido #{pedido.id}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}