"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


type Mesa = {
    id: number;
    numero: number;
};

type Plato = {
    id: number;
    nombre: string;
    precio: number;
};

type Pedido = {
    id: number;
    mesa: {
        numero: number;
    };
    platos: Plato[];
    estado: string;
    total: number;
};

export default function PedidosPage() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [platos, setPlatos] = useState<Plato[]>([]);
    const [mesaId, setMesaId] = useState("");
    const [platoIds, setPlatoIds] = useState<number[]>([]);
    const [error, setError] = useState("");

    async function cargarDatos() {
        try {
            const [pedidosRes, mesasRes, platosRes] = await Promise.all([
                fetch(`${API_URL}/pedidos`, {
                    cache: "no-store",
                }),
                fetch(`${API_URL}/mesas`, {
                    cache: "no-store",
                }),
                fetch(`${API_URL}/platos`, {
                    cache: "no-store",
                }),
            ]);

            const pedidosData = await pedidosRes.json();
            const mesasData = await mesasRes.json();
            const platosData = await platosRes.json();

            setPedidos(pedidosData);
            setMesas(mesasData);
            setPlatos(platosData);
        } catch (error) {
            console.error(error);
            setError("No se pudo conectar con el backend");
        }
    }

    useEffect(() => {
        cargarDatos();
    }, []);

    function togglePlato(id: number) {
        setPlatoIds((prev) =>
            prev.includes(id)
                ? prev.filter((p) => p !== id)
                : [...prev, id]
        );
    }

    async function crearPedido(e: React.FormEvent) {
        e.preventDefault();

        try {
            const res = await fetch(`${API_URL}/pedidos`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        mesaId: Number(mesaId),
                        platoIds,
                    }),
                }
            );

            if (!res.ok) {
                throw new Error("Error al crear pedido");
            }

            setMesaId("");
            setPlatoIds([]);

            await cargarDatos();

            alert("Pedido creado correctamente");
        } catch (error) {
            console.error(error);
            alert("No se pudo crear el pedido");
        }
    }

    return (
        <main className="min-h-screen p-8 bg-black text-amber-50">
            <h1 className="text-4xl font-bold mb-8">
                Pedidos Activos
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">
                    {error}
                </div>
            )}

            {/* FORMULARIO */}
            <form
                onSubmit={crearPedido}
                className="border border-amber-300 bg-[#F5F0E6] text-black rounded-lg p-6 shadow-lg mb-8"
            >
                <h2 className="text-2xl font-bold mb-4">
                    Crear Pedido
                </h2>

                <div className="mb-4">
                    <label className="block mb-2 font-semibold">
                        Mesa
                    </label>

                    <select
                        value={mesaId}
                        onChange={(e) =>
                            setMesaId(e.target.value)
                        }
                        className="border border-amber-300 bg-amber-50 rounded p-2 w-full text-black"
                        required
                    >
                        <option value="">
                            Seleccione una mesa
                        </option>

                        {mesas.map((mesa) => (
                            <option
                                key={mesa.id}
                                value={mesa.id}
                            >
                                Mesa {mesa.numero}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2 font-semibold">
                        Platos
                    </label>

                    <div className="space-y-2">
                        {platos.map((plato) => (
                            <label
                                key={plato.id}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="checkbox"
                                    checked={platoIds.includes(
                                        plato.id
                                    )}
                                    onChange={() =>
                                        togglePlato(plato.id)
                                    }
                                />

                                {plato.nombre} - S/.{" "}
                                {plato.precio}
                            </label>
                        ))}
                    </div>
                </div>
                <button
                    type="submit"
                    className="bg-amber-800 hover:bg-amber-700 text-amber-50 px-4 py-2 rounded transition"
                >
                    Crear Pedido
                </button>
            </form>

            {/* LISTA DE PEDIDOS */}
            <div className="space-y-4">
                {pedidos.map((pedido) => (
                    <div
                        key={pedido.id}
                        className="border border-amber-300 bg-[#F5F0E6] text-black rounded-lg p-4 shadow-lg"
                    >
                        <h2 className="font-bold text-lg">
                            Pedido #{pedido.id}
                        </h2>

                        <p>Mesa: {pedido.mesa.numero}</p>

                        <p>
                            Platos:{" "}
                            {pedido.platos.map((p) => p.nombre).join(", ")}
                        </p>

                        <p>Estado: {pedido.estado}</p>

                        <p className="font-semibold">
                            Total: S/. {pedido.total}
                        </p>

                        {/* 🔥 BOTÓN COMANDA */}
                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch(
                                        `${process.env.NEXT_PUBLIC_API_URL}/comandas`,
                                        {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                            },
                                            body: JSON.stringify({
                                                pedidoId: pedido.id,
                                            }),
                                        }
                                    );

                                    if (!res.ok) {
                                        throw new Error("Error al crear comanda");
                                    }

                                    alert("Comanda creada correctamente");
                                } catch (error) {
                                    console.error(error);
                                    alert("Error al enviar a cocina");
                                }
                            }}
                            className="bg-yellow-600 text-white px-3 py-1 rounded mt-3"
                        >
                            Enviar a cocina (Comanda)
                        </button>
                    </div>
                ))}
            </div>
        </main >
    );
}