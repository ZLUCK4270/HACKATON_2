"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const imagenes = [
  "/images/ceviche.jpg",
  "/images/lomo-saltado.jpg",
  "/images/causa.jpg",
  "/images/anticuchos.jpg",
  "/images/pollo-brasa.jpg",
];

export default function Home() {
  const [totalPlatos, setTotalPlatos] = useState(0);
  const [totalMesas, setTotalMesas] = useState(0);
  const [pedidosHoy, setPedidosHoy] = useState(0);
  const [error, setError] = useState("");

  const [imagenActual, setImagenActual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setImagenActual((prev) =>
        prev === imagenes.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [platosRes, mesasRes, pedidosRes] = await Promise.all([
          fetch(`${API_URL}/platos`),
          fetch(`${API_URL}/mesas`),
          fetch(`${API_URL}/pedidos`),
        ]);

        const platos = await platosRes.json();
        const mesas = await mesasRes.json();
        const pedidos = await pedidosRes.json();

        setTotalPlatos(Array.isArray(platos) ? platos.length : 0);
        setTotalMesas(Array.isArray(mesas) ? mesas.length : 0);
        setPedidosHoy(Array.isArray(pedidos) ? pedidos.length : 0);
      } catch (err) {
        setError("No se pudo conectar con el backend");
      }
    }

    cargarDatos();
  }, []);

  return (
    <main className="min-h-screen bg-black text-amber-50">
      {/* HERO CON CARRUSEL */}
      <section className="relative h-[70vh] overflow-hidden">
        <img
          src={imagenes[imagenActual]}
          alt="Comida Peruana"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-1000"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            Sistema de Restaurante
          </h1>

          <p className="text-xl md:text-2xl max-w-3xl">
            Gestión moderna de platos,
            mesas y pedidos con cocina
            peruana.
          </p>
        </div>
      </section>

      {/* MENSAJE DE ERROR */}
      {error && (
        <div className="max-w-6xl mx-auto mt-6">
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
            {error}
          </div>
        </div>
      )}

      {/* ESTADÍSTICAS */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-6">
          Resumen General
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#F5F0E6] text-black rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold">
              Total Platos
            </h3>

            <p className="text-5xl font-bold mt-3">
              {totalPlatos}
            </p>
          </div>

          <div className="bg-[#F5F0E6] text-black rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold">
              Total Mesas
            </h3>

            <p className="text-5xl font-bold mt-3">
              {totalMesas}
            </p>
          </div>

          <div className="bg-[#F5F0E6] text-black rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold">
              Pedidos del Día
            </h3>

            <p className="text-5xl font-bold mt-3">
              {pedidosHoy}
            </p>
          </div>
        </div>
      </section>

      {/* NAVEGACIÓN */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <h2 className="text-3xl font-bold mb-6">
          Módulos del Sistema
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/platos"
            className="bg-[#F5F0E6] text-black rounded-xl p-6 shadow-lg hover:scale-105 transition"
          >
            <h3 className="text-2xl font-bold mb-2">
              🍽️ Platos
            </h3>

            <p>
              Administrar platos del
              restaurante.
            </p>
          </Link>

          <Link
            href="/mesas"
            className="bg-[#F5F0E6] text-black rounded-xl p-6 shadow-lg hover:scale-105 transition"
          >
            <h3 className="text-2xl font-bold mb-2">
              🪑 Mesas
            </h3>

            <p>
              Gestionar disponibilidad y
              estados.
            </p>
          </Link>

          <Link
            href="/pedidos"
            className="bg-[#F5F0E6] text-black rounded-xl p-6 shadow-lg hover:scale-105 transition"
          >
            <h3 className="text-2xl font-bold mb-2">
              📋 Pedidos
            </h3>

            <p>
              Crear y monitorear pedidos
              activos.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}