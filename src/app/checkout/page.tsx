"use client";
import type { CheckoutRequest, PaymentCheckoutBody } from "@/lib/types";
export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold text-brand">Pago</h1>
      <p className="mt-4 text-neutral-500">Confirma tu pedido (sin pasarela real en MVP).</p>
    </main>
  );
}
