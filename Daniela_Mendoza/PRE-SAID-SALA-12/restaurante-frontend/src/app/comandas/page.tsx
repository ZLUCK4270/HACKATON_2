"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ComandasPage() {
    const [comandas, setComandas] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${API_URL}/comandas`)
            .then((res) => res.json())
            .then((data) => setComandas(data));
    }, []);

    const avanzarEstado = async (id: number, estadoActual: string) => {
        let nuevoEstado = "";

        if (estadoActual === "recibida") nuevoEstado = "en_preparacion";
        else if (estadoActual === "en_preparacion") nuevoEstado = "lista";
        else if (estadoActual === "lista") nuevoEstado = "entregada";
        else return;

        await fetch(`${API_URL}/comandas/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: nuevoEstado }),
        });

        setComandas((prev) =>
            prev.map((c) =>
                c.id === id ? { ...c, estado: nuevoEstado } : c
            )
        );
    };

    const generarTicket = async (comandaId: number) => {
        try {
            const res = await fetch(`${API_URL}/tickets`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    comandaId,
                }),
            });

            if (!res.ok) {
                throw new Error("Error al crear ticket");
            }

            alert("Ticket generado correctamente");
        } catch (error) {
            console.error(error);
            alert("Error al generar ticket");
        }
    };

    const colorEstado = (estado: string) => {
        switch (estado) {
            case "recibida":
                return "text-yellow-600";
            case "en_preparacion":
                return "text-blue-600";
            case "lista":
                return "text-green-600";
            case "entregada":
                return "text-gray-500";
            default:
                return "text-black";
        }
    };

    return (
        <main className="min-h-screen bg-black text-amber-50 p-8">
            <h1 className="text-4xl font-bold mb-8">
                🍽️ Comandas
            </h1>

            {comandas.length === 0 ? (
                <p className="text-gray-400">
                    No hay comandas
                </p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {comandas.map((comanda: any) => (
                        <div
                            key={comanda.id}
                            className="bg-[#F5F0E6] text-black rounded-xl shadow-lg p-5 border border-amber-300"
                        >
                            <h3 className="text-xl font-bold mb-2">
                                Comanda #{comanda.id}
                            </h3>

                            <p className="mb-1">
                                <span className="font-semibold">
                                    Estado:
                                </span>{" "}
                                <span
                                    className={colorEstado(
                                        comanda.estado
                                    )}
                                >
                                    {comanda.estado}
                                </span>
                            </p>

                            <p className="mb-1">
                                <span className="font-semibold">
                                    Pedido ID:
                                </span>{" "}
                                {comanda.pedido?.id}
                            </p>

                            <p className="mb-2">
                                <span className="font-semibold">
                                    Mesa:
                                </span>{" "}
                                {comanda.pedido?.mesa?.numero}
                            </p>

                            <div className="mb-3">
                                <p className="font-semibold mb-1">
                                    Platos:
                                </p>

                                <ul className="list-disc pl-5 text-sm">
                                    {comanda.pedido?.platos?.map(
                                        (plato: any) => (
                                            <li key={plato.id}>
                                                {plato.nombre} - S/{plato.precio}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>

                            {/* BOTÓN AVANZAR ESTADO */}
                            {comanda.estado !== "entregada" && (
                                <button
                                    onClick={() =>
                                        avanzarEstado(
                                            comanda.id,
                                            comanda.estado
                                        )
                                    }
                                    className="w-full bg-amber-800 hover:bg-amber-700 text-white py-2 rounded-lg transition mb-2"
                                >
                                    Avanzar estado
                                </button>
                            )}

                            {/* 🔥 BOTÓN GENERAR TICKET */}
                            <button
                                onClick={() =>
                                    generarTicket(comanda.id)
                                }
                                className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded-lg transition"
                            >
                                💳 Generar Ticket
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
} 