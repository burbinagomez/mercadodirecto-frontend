"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  category: string;
  price_per_kg: number;
  unit: string;
  department: string;
  quantity_available: number;
}

export default function MarketplacePage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["products", q, category, department],
    queryFn: () =>
      apiFetch<Product[]>(
        `/products?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&department=${encodeURIComponent(department)}`
      ),
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold text-brand">Mercado</h1>
      <div className="mt-6 flex flex-wrap gap-3">
        <input className="rounded border p-2" placeholder="Buscar..." value={q}
          onChange={(e) => setQ(e.target.value)} />
        <input className="rounded border p-2" placeholder="Categoría" value={category}
          onChange={(e) => setCategory(e.target.value)} />
        <input className="rounded border p-2" placeholder="Departamento" value={department}
          onChange={(e) => setDepartment(e.target.value)} />
      </div>
      {isLoading && <p className="mt-6">Cargando...</p>}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((p) => (
          <Link key={p.id} href={`/products/${p.id}`}
            className="block rounded-lg border bg-white p-4 hover:shadow">
            <h2 className="font-semibold">{p.name}</h2>
            <p className="text-sm text-neutral-500">{p.category} · {p.department}</p>
            <p className="mt-2 font-bold text-brand">
              ${p.price_per_kg}/{p.unit}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
