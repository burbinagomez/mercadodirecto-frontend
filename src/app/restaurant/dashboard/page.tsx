"use client";

import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Users,
  Calendar,
  Clock,
  Package,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  History,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivered";

interface Order {
  id: number;
  farmer_name: string;
  status: OrderStatus;
  total: number;
  created_at: string;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  preparing: "bg-purple-100 text-purple-800 border-purple-300",
  ready: "bg-green-100 text-green-800 border-green-300",
  delivered: "bg-neutral-100 text-neutral-500 border-neutral-300",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function statusIcon(s: OrderStatus) {
  switch (s) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "confirmed":
      return <AlertCircle className="h-4 w-4" />;
    case "preparing":
      return <Package className="h-4 w-4" />;
    case "ready":
      return <CheckCircle2 className="h-4 w-4" />;
    case "delivered":
      return <History className="h-4 w-4" />;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days > 1 ? "s" : ""}`;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function RestaurantDashboard() {
  const { role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Order[]>("/orders?role=restaurant")
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const activeOrders = orders.filter((o) => o.status !== "delivered");
  const pastOrders = orders.filter((o) => o.status === "delivered");

  /* pipeline counts */
  const pipelineCounts: Record<OrderStatus, number> = {
    pending: activeOrders.filter((o) => o.status === "pending").length,
    confirmed: activeOrders.filter((o) => o.status === "confirmed").length,
    preparing: activeOrders.filter((o) => o.status === "preparing").length,
    ready: activeOrders.filter((o) => o.status === "ready").length,
    delivered: 0, // not in pipeline
  };

  const pipelineSteps: OrderStatus[] = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand">Mi panel</h1>
          <p className="mt-1 text-neutral-500">
            {role === "restaurant"
              ? "Panel de gestión para tu restaurante"
              : "Panel de restaurante"}
          </p>
        </div>
        {role && (
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            {role === "restaurant" ? "Restaurante" : role}
          </span>
        )}
      </div>

      {/* ── Status pipeline ── */}
      <section className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-800">
          <Package className="h-5 w-5 text-brand" />
          Pedidos activos
        </h2>
        {loading ? (
          <div className="grid grid-cols-4 gap-3">
            {pipelineSteps.map((s) => (
              <div key={s} className="animate-pulse rounded-lg border p-4">
                <div className="mb-2 h-3 w-16 rounded bg-neutral-200" />
                <div className="h-6 w-8 rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {pipelineSteps.map((s) => (
              <div
                key={s}
                className={`flex flex-col items-center rounded-lg border-2 p-4 text-center transition ${
                  pipelineCounts[s] > 0
                    ? STATUS_COLORS[s]
                    : "border-dashed border-neutral-200 bg-neutral-50 text-neutral-400"
                }`}
              >
                <div className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wide">
                  {statusIcon(s)}
                  {STATUS_LABELS[s]}
                </div>
                <span className="text-2xl font-bold">
                  {pipelineCounts[s]}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Active orders list ── */}
      {activeOrders.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Pedidos recientes
          </h2>
          <ul className="divide-y rounded-lg border">
            {activeOrders.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between px-4 py-3 transition hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_COLORS[o.status]
                    }`}
                  >
                    {statusIcon(o.status)}
                    {STATUS_LABELS[o.status]}
                  </span>
                  <span className="font-medium text-neutral-800">
                    #{o.id}
                  </span>
                  <span className="text-sm text-neutral-600">
                    {o.farmer_name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Clock className="h-3.5 w-3.5" />
                  {timeAgo(o.created_at)}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Past orders ── */}
      {pastOrders.length > 0 && (
        <section className="mt-8">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
          >
            <span className="flex items-center gap-2">
              <History className="h-4 w-4 text-neutral-400" />
              Pedidos anteriores ({pastOrders.length})
            </span>
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </button>
        </section>
      )}

      {/* ── Empty state ── */}
      {!loading && orders.length === 0 && (
        <section className="mt-8 rounded-lg border border-dashed border-neutral-200 py-12 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-neutral-300" />
          <p className="mt-3 text-neutral-500">
            Aún no tienes pedidos.
          </p>
          <p className="mt-1 text-sm text-neutral-400">
            Empieza explorando los productos de nuestros agricultores.
          </p>
        </section>
      )}

      {/* ── Quick actions ── */}
      <section className="mt-10 grid gap-3 sm:grid-cols-2">
        <Link
          href="/marketplace"
          className="flex items-center justify-between rounded-lg border border-brand/20 bg-brand/5 px-5 py-4 transition hover:bg-brand/10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
              <Users className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="font-semibold text-neutral-800">
                Explorar agricultores
              </p>
              <p className="text-sm text-neutral-500">
                Descubre productos locales
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-brand" />
        </Link>

        <Link
          href="/pickups"
          className="flex items-center justify-between rounded-lg border border-brand/20 bg-brand/5 px-5 py-4 transition hover:bg-brand/10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
              <Calendar className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="font-semibold text-neutral-800">
                Programa de recogidas
              </p>
              <p className="text-sm text-neutral-500">
                Consulta tus próximas recogidas
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-brand" />
        </Link>
      </section>
    </main>
  );
}
