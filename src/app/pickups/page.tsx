"use client";

import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Truck,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Package,
  ArrowLeft,
  User,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type PickupStatus = "scheduled" | "in_transit" | "collected" | "delivered";

interface Pickup {
  id: number;
  order_id: number;
  farmer_name: string;
  restaurant_name: string;
  pickup_date: string;
  pickup_time_start: string;
  pickup_time_end: string;
  status: PickupStatus;
  carrier_name: string | null;
  notes?: string;
}

const STATUS_LABELS: Record<PickupStatus, string> = {
  scheduled: "Programada",
  in_transit: "En camino",
  collected: "Recogido",
  delivered: "Entregado",
};

const STATUS_COLORS: Record<PickupStatus, string> = {
  scheduled: "bg-blue-100 text-blue-800 border-blue-300",
  in_transit: "bg-purple-100 text-purple-800 border-purple-300",
  collected: "bg-amber-100 text-amber-800 border-amber-300",
  delivered: "bg-neutral-100 text-neutral-500 border-neutral-300",
};

const STATUS_ICONS: Record<PickupStatus, React.ReactNode> = {
  scheduled: <Calendar className="h-4 w-4" />,
  in_transit: <Truck className="h-4 w-4" />,
  collected: <Package className="h-4 w-4" />,
  delivered: <CheckCircle2 className="h-4 w-4" />,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00"); // midday to avoid tz issues
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  return d.toLocaleDateString("es-CO", opts);
}

function formatTimeRange(start: string, end: string): string {
  return `${start} – ${end}`;
}

function isUpcoming(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pickup = new Date(dateStr + "T12:00:00");
  return pickup >= today;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function PickupCard({
  pickup,
  role,
}: {
  pickup: Pickup;
  role: "farmer" | "restaurant" | "admin" | null;
}) {
  const upcoming = isUpcoming(pickup.pickup_date);

  return (
    <div className="rounded-lg border bg-white p-4 transition hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {/* Left: info */}
        <div className="min-w-0 flex-1">
          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              STATUS_COLORS[pickup.status]
            }`}
          >
            {STATUS_ICONS[pickup.status]}
            {STATUS_LABELS[pickup.status]}
          </span>

          {/* Date & time */}
          <div className="mt-3 space-y-1.5 text-sm text-neutral-700">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-400" />
              <span>{formatDate(pickup.pickup_date)}</span>
              {!upcoming && (
                <span className="text-xs text-neutral-400">(pasada)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-400" />
              <span>{formatTimeRange(pickup.pickup_time_start, pickup.pickup_time_end)}</span>
            </div>
          </div>

          {/* Role-specific info */}
          {role === "farmer" && (
            <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
              <User className="h-4 w-4 text-neutral-400" />
              <span>
                Comprador: <strong>{pickup.restaurant_name}</strong>
              </span>
            </div>
          )}
          {role === "restaurant" && (
            <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
              <User className="h-4 w-4 text-neutral-400" />
              <span>
                Agricultor: <strong>{pickup.farmer_name}</strong>
              </span>
            </div>
          )}
          {(role === "admin" || role == null) && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-neutral-400" />
                <strong>{pickup.farmer_name}</strong>
                <span className="text-neutral-300">→</span>
                <strong>{pickup.restaurant_name}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Right: carrier + action */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          {pickup.carrier_name ? (
            <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
              <Truck className="h-3 w-3" />
              {pickup.carrier_name}
            </span>
          ) : (
            (role === "admin" || role == null) && (
              <button
                type="button"
                className="rounded bg-brand px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-dark"
              >
                Asignar transportista
              </button>
            )
          )}
          <Link
            href={`/orders/${pickup.order_id}`}
            className="inline-flex items-center gap-0.5 text-xs text-brand hover:underline"
          >
            Pedido #{pickup.order_id}
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function PickupsPage() {
  const { role } = useAuth();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Pickup[]>("/pickups")
      .then(setPickups)
      .catch(() => setPickups([]))
      .finally(() => setLoading(false));
  }, []);

  const upcomingPickups = pickups.filter((p) => isUpcoming(p.pickup_date));
  const pastPickups = pickups.filter((p) => !isUpcoming(p.pickup_date));
  const unassignedPickups = pickups.filter((p) => !p.carrier_name);

  const displayRole =
    role === "farmer" ? "farmer" : role === "restaurant" ? "restaurant" : "admin";

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* ── Back link ── */}
      <Link
        href={role === "restaurant" ? "/restaurant/dashboard" : "/"}
        className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
      >
        <ArrowLeft className="h-4 w-4" />
        {role === "restaurant" ? "Volver al panel" : "Volver al inicio"}
      </Link>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand">Programa de recogidas</h1>
          <p className="mt-1 text-neutral-500">
            {role === "farmer" && "Tus próximas recogidas y entregas"}
            {role === "restaurant" && "Ventanas de recogida de tus pedidos"}
            {(role !== "farmer" && role !== "restaurant") &&
              "Gestión de recogidas — asigna transportistas"}
          </p>
        </div>
        {role && (
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium capitalize text-brand">
            {role === "restaurant" ? "Restaurante" : role === "farmer" ? "Agricultor" : "Admin"}
          </span>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4">
              <div className="mb-2 h-4 w-24 rounded bg-neutral-200" />
              <div className="h-4 w-48 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <>
          {/* ── Admin: unassigned banner ── */}
          {(role !== "farmer" && role !== "restaurant") && unassignedPickups.length > 0 && (
            <section className="mt-6 rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  {unassignedPickups.length} recogida{unassignedPickups.length > 1 ? "s" : ""} sin transportista
                </span>
              </div>
              <p className="mt-1 text-sm text-amber-700">
                Asigna un transportista para cada recogida desde la lista siguiente.
              </p>
            </section>
          )}

          {/* ── Upcoming / active pickups ── */}
          {upcomingPickups.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-neutral-800">
                <Clock className="h-5 w-5 text-brand" />
                {role === "farmer"
                  ? "Próximas recogidas"
                  : role === "restaurant"
                  ? "Próximas ventanas de recogida"
                  : "Recogidas activas"}
              </h2>
              <div className="space-y-3">
                {upcomingPickups.map((p) => (
                  <PickupCard key={p.id} pickup={p} role={displayRole} />
                ))}
              </div>
            </section>
          )}

          {/* ── Past pickups ── */}
          {pastPickups.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                <CheckCircle2 className="h-4 w-4" />
                Recogidas anteriores ({pastPickups.length})
              </h2>
              <div className="space-y-2">
                {pastPickups.map((p) => (
                  <PickupCard key={p.id} pickup={p} role={displayRole} />
                ))}
              </div>
            </section>
          )}

          {/* ── Empty state ── */}
          {pickups.length === 0 && (
            <section className="mt-8 rounded-lg border border-dashed border-neutral-200 py-12 text-center">
              <Calendar className="mx-auto h-10 w-10 text-neutral-300" />
              <p className="mt-3 text-neutral-500">No hay recogidas programadas.</p>
              <p className="mt-1 text-sm text-neutral-400">
                {role === "restaurant"
                  ? "Los pedidos que realices aparecerán aquí con su ventana de recogida."
                  : role === "farmer"
                  ? "Las recogidas de tus productos aparecerán aquí."
                  : "Las recogidas aparecerán aquí cuando haya pedidos activos."}
              </p>
              {role === "restaurant" && (
                <Link
                  href="/marketplace"
                  className="mt-4 inline-block rounded bg-brand px-4 py-2 text-sm text-white"
                >
                  Explorar productos
                </Link>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
