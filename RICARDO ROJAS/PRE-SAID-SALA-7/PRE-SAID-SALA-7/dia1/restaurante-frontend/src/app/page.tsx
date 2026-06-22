"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Dashboard() {
  const [platos, setPlatos] = useState<number>(0);
  const [mesas, setMesas] = useState<number>(0);
  const [pedidos, setPedidos] = useState<number>(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/platos`).then((r) => r.json()),
      fetch(`${API}/mesas`).then((r) => r.json()),
      fetch(`${API}/pedidos`).then((r) => r.json()),
    ])
      .then(([p, m, ped]) => {
        setPlatos(p.length);
        setMesas(m.length);
        setPedidos(ped.length);
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-lg">No se pudo conectar con el servidor</p>
        <p className="text-gray-500 text-sm mt-1">Asegurate de que el backend esté corriendo en {API}</p>
      </div>
    );
  }

  const cards = [
    { label: "Total Platos", value: platos, href: "/platos", color: "bg-blue-500" },
    { label: "Total Mesas", value: mesas, href: "/mesas", color: "bg-green-500" },
    { label: "Pedidos del día", value: pedidos, href: "/pedidos", color: "bg-orange-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <div className="bg-white rounded-xl shadow p-5 hover:shadow-md transition cursor-pointer">
              <div className={`w-10 h-10 rounded-full ${c.color} text-white flex items-center justify-center text-lg font-bold mb-3`}>
                {c.value}
              </div>
              <p className="text-gray-600 text-sm">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/platos" className="bg-white rounded-xl shadow p-5 hover:shadow-md transition">
          <h2 className="font-semibold">🍽️ Gestionar Platos</h2>
          <p className="text-sm text-gray-500 mt-1">Ver, crear y modificar platos del menú</p>
        </Link>
        <Link href="/mesas" className="bg-white rounded-xl shadow p-5 hover:shadow-md transition">
          <h2 className="font-semibold">🪑 Estado de Mesas</h2>
          <p className="text-sm text-gray-500 mt-1">Consultar y cambiar estado de las mesas</p>
        </Link>
        <Link href="/pedidos" className="bg-white rounded-xl shadow p-5 hover:shadow-md transition">
          <h2 className="font-semibold">📋 Pedidos</h2>
          <p className="text-sm text-gray-500 mt-1">Administrar pedidos activos y crear nuevos</p>
        </Link>
      </div>
    </div>
  );
}
