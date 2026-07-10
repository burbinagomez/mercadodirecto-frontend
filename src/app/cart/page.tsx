"use client";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import { ShoppingCart, Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, total, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-3xl font-bold text-brand">Carrito</h1>
        <div className="mt-10 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-neutral-300" />
          <p className="mt-3 text-neutral-500">Tu carrito está vacío por ahora.</p>
          <Link
            href="/marketplace"
            className="mt-4 inline-block rounded bg-brand px-6 py-2 text-white hover:bg-brand-dark"
          >
            Ir al mercado
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold text-brand">Carrito</h1>
      <p className="mt-1 text-sm text-neutral-500">{items.length} producto{items.length === 1 ? "" : "s"}</p>

      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li
            key={item.product_id}
            className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{item.name}</p>
              <p className="mt-0.5 text-sm text-neutral-500">
                {item.quantity} {item.unit} × ${item.price_per_kg}/{item.unit}
              </p>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <span className="font-bold text-brand whitespace-nowrap">
                ${(item.quantity * item.price_per_kg).toFixed(2)}
              </span>
              <button
                onClick={() => removeItem(item.product_id)}
                className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label={`Quitar ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-brand">${total.toFixed(2)}</span>
        </div>

        <Link
          href="/checkout"
          className="mt-4 block w-full rounded-lg bg-brand px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Ir a pagar
        </Link>
      </div>
    </main>
  );
}
