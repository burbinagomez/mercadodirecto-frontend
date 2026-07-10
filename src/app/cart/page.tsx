"use client";
import type { CartItemInput, CheckoutRequest } from "@/lib/types";
export default function CartPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold text-brand">Carrito</h1>
      <p className="mt-4 text-neutral-500">Tu carrito está vacío por ahora.</p>
    </main>
  );
}
