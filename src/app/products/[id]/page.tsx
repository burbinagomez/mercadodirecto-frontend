"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function ProductDetail() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => apiFetch<{
      id: number; name: string; category: string; price_per_kg: number;
      unit: string; department: string; quantity_available: number;
    }>(`/products/${id}`),
  });

  if (isLoading) return <p className="p-10">Cargando...</p>;
  if (!data) return <p className="p-10">No encontrado</p>;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold">{data.name}</h1>
      <p className="mt-2 text-neutral-500">{data.category} · {data.department}</p>
      <p className="mt-4 text-2xl font-bold text-brand">${data.price_per_kg}/{data.unit}</p>
      <p className="mt-2">Disponible: {data.quantity_available} {data.unit}</p>
      <button className="mt-6 rounded bg-brand px-5 py-2 text-white">
        Añadir al carrito
      </button>
    </main>
  );
}
