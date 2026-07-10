"use client";
import { useQuery } from "@tanstack/react-query";
import { listOrders } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types";
import { Package } from "lucide-react";

const STATUS_BADGES: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  paying:    { label: "Pendiente",      className: "bg-yellow-100 text-yellow-800" },
  paid:      { label: "Pagado",         className: "bg-blue-100 text-blue-800" },
  scheduled: { label: "Programado",     className: "bg-indigo-100 text-indigo-800" },
  collected: { label: "Recolectado",    className: "bg-purple-100 text-purple-800" },
  delivered: { label: "Entregado",      className: "bg-green-100 text-green-800" },
  pay_fail:  { label: "Pago fallido",   className: "bg-red-100 text-red-800" },
  cancelled: { label: "Cancelado",      className: "bg-neutral-100 text-neutral-600" },
};

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: listOrders,
    refetchInterval: 10_000,
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold text-brand">Mis pedidos</h1>

      {isLoading && <p className="mt-6">Cargando pedidos...</p>}

      {!isLoading && (!orders || orders.length === 0) && (
        <div className="mt-10 text-center">
          <Package className="mx-auto h-12 w-12 text-neutral-300" />
          <p className="mt-3 text-neutral-500">Aún no tienes pedidos.</p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {orders?.map((order) => {
          const badge = STATUS_BADGES[order.status];
          return (
            <div
              key={order.id}
              className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">Pedido #{order.id}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>

              <p className="mt-1 text-xs text-neutral-500">
                {new Date(order.created_at).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <p className="mt-2 text-sm font-medium">
                Total: <span className="text-brand">${order.total.toFixed(2)}</span>
              </p>

              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-neutral-500 hover:text-neutral-700">
                  Ver productos ({order.items.length})
                </summary>
                <ul className="mt-2 space-y-1 border-t pt-2">
                  {order.items.map((item) => (
                    <li
                      key={item.product_id}
                      className="flex justify-between text-xs"
                    >
                      <span>
                        {item.name} × {item.quantity} {item.unit}
                      </span>
                      <span className="font-medium">
                        ${(item.quantity * item.price_per_kg).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          );
        })}
      </div>
    </main>
  );
}
