"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Plato = {
    id: number;
    nombre: string;
    precio: number;
    disponible: boolean;
};

export default function PlatosPage() {
    const [platos, setPlatos] = useState<Plato[]>([]);
    const [error, setError] = useState("");

    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState("");
    const [disponible, setDisponible] = useState(true);

    useEffect(() => {
        cargarPlatos();
    }, []);

    const cargarPlatos = () => {
        fetch(`${API_URL}/platos`)
            .then((res) => res.json())
            .then((data) => setPlatos(data))
            .catch(() =>
                setError("No se pudo conectar con el backend")
            );
    };

    const crearPlato = async () => {
        try {
            const res = await fetch(`${API_URL}/platos`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nombre,
                        precio: Number(precio),
                        disponible,
                    }),
                }
            );

            if (!res.ok) {
                throw new Error();
            }

            setNombre("");
            setPrecio("");
            setDisponible(true);

            cargarPlatos();
        } catch {
            setError("Error al crear plato");
        }
    };

    return (
        <main className="min-h-screen p-8 bg-black text-amber-50">
            <h1 className="text-4xl font-bold mb-8">
                Gestión de Platos
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Formulario */}
            <div className="border border-amber-300 bg-[#F5F0E6] text-black rounded-lg p-6 shadow-lg mb-8">
                <h2 className="text-2xl font-bold mb-4">
                    Nuevo Plato
                </h2>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Nombre del plato"
                        value={nombre}
                        onChange={(e) =>
                            setNombre(e.target.value)
                        }
                        className="border border-amber-300 bg-amber-50 rounded p-2"
                    />

                    <input
                        type="number"
                        placeholder="Precio"
                        value={precio}
                        onChange={(e) =>
                            setPrecio(e.target.value)
                        }
                        className="border border-amber-300 bg-amber-50 rounded p-2"
                    />

                    <label className="flex items-center gap-2 font-medium">
                        <input
                            type="checkbox"
                            checked={disponible}
                            onChange={(e) =>
                                setDisponible(
                                    e.target.checked
                                )
                            }
                        />
                        Disponible
                    </label>
                </div>

                <button
                    onClick={crearPlato}
                    className="bg-amber-800 hover:bg-amber-700 text-amber-50 px-4 py-2 rounded transition"
                >
                    Crear Plato
                </button>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full border border-amber-300 bg-[#F5F0E6] text-black rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-amber-200">
                            <th className="border border-amber-300 p-3 text-left">
                                Nombre
                            </th>
                            <th className="border border-amber-300 p-3 text-left">
                                Precio
                            </th>
                            <th className="border border-amber-300 p-3 text-left">
                                Disponible
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {platos.map((plato) => (
                            <tr
                                key={plato.id}
                                className="hover:bg-amber-100"
                            >
                                <td className="border border-amber-300 p-3">
                                    {plato.nombre}
                                </td>

                                <td className="border border-amber-300 p-3">
                                    S/. {plato.precio}
                                </td>

                                <td className="border border-amber-300 p-3">
                                    <span
                                        className={
                                            plato.disponible
                                                ? "text-green-600 font-semibold"
                                                : "text-red-600 font-semibold"
                                        }
                                    >
                                        {plato.disponible
                                            ? "Sí"
                                            : "No"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}