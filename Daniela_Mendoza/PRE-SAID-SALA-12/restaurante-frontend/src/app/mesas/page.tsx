"use client";

import { useEffect, useState } from "react";


const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Mesa = {
    id: number;
    numero: number;
    capacidad: number;
    estado: string;
};

export default function MesasPage() {
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [error, setError] = useState("");

    async function cargarMesas() {
        try {
            setError("");

            const res = await fetch(`${API_URL}/mesas`, {
                cache: "no-store",
            });

            const data = await res.json();
            setMesas(data);
        } catch (error) {
            console.error(error);
            setError("No se pudo conectar con el backend");
        }
    }

    useEffect(() => {
        cargarMesas();
    }, []);

    async function cambiarEstado(
        id: number,
        nuevoEstado: string
    ) {
        try {
            const res = await fetch(`${API_URL}/mesas/${id}/estado`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        estado: nuevoEstado,
                    }),
                }
            );

            if (!res.ok) {
                throw new Error("Error al actualizar");
            }

            await cargarMesas();
        } catch (error) {
            console.error(error);
            alert("No se pudo cambiar el estado");
        }
    }

    function colorEstado(estado: string) {
        switch (estado.toLowerCase()) {
            case "disponible":
                return "text-green-600";

            case "ocupada":
                return "text-red-600";

            case "reservada":
                return "text-yellow-600";

            default:
                return "text-black";
        }
    }

    return (
        <main className="min-h-screen p-8 bg-black text-amber-50">
            <h1 className="text-4xl font-bold mb-8">
                Estado de Mesas
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mesas.map((mesa) => (
                    <div
                        key={mesa.id}
                        className="border border-amber-300 bg-[#F5F0E6] text-black rounded-lg p-5 shadow-lg"
                    >
                        <h2 className="text-xl font-bold mb-2">
                            Mesa {mesa.numero}
                        </h2>

                        <p className="mb-2">
                            Capacidad: {mesa.capacidad}
                        </p>

                        <p
                            className={`font-semibold mb-4 ${colorEstado(
                                mesa.estado
                            )}`}
                        >
                            Estado: {mesa.estado}
                        </p>

                        <select
                            value={mesa.estado}
                            onChange={(e) =>
                                cambiarEstado(
                                    mesa.id,
                                    e.target.value
                                )
                            }
                            className="w-full border border-amber-300 bg-amber-50 rounded p-2 text-black"
                        >
                            <option value="disponible">
                                Disponible
                            </option>

                            <option value="ocupada">
                                Ocupada
                            </option>

                            <option value="reservada">
                                Reservada
                            </option>
                        </select>
                    </div>
                ))}
            </div>
        </main>
    );
}