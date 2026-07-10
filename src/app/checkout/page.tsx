"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { createCheckout, getOrderStatus } from "@/lib/orders";
import type { PaymentMethod, OrderStatus } from "@/lib/types";
import {
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Info,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */

const STATUS_LABELS: Record<OrderStatus, string> = {
  paying:    "Esperando pago",
  paid:      "Pagado",
  scheduled: "Programado para recolección",
  collected: "Recolectado por el agricultor",
  delivered: "Entregado",
  pay_fail:  "Pago fallido",
  cancelled: "Cancelado",
};

/** Ordered subset shown in the stepper (terminal states excluded). */
const STEP_ORDER: OrderStatus[] = [
  "paying",
  "paid",
  "scheduled",
  "collected",
  "delivered",
];

const TERMINAL: Set<OrderStatus> = new Set(["delivered", "pay_fail", "cancelled"]);

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("fiat_to_fiat");
  const [velafiOrderId, setVelafiOrderId] = useState<string | null>(null);

  /* ---- Create checkout (POST) ---- */
  const checkout = useMutation({
    mutationFn: () => createCheckout(items, paymentMethod),
    onSuccess(data) {
      setVelafiOrderId(data.velafi_order_id);
    },
  });

  /* ---- Poll order status ---- */
  const statusQuery = useQuery({
    queryKey: ["order-status", velafiOrderId],
    queryFn: () => getOrderStatus(velafiOrderId!),
    enabled: !!velafiOrderId,
    refetchInterval(query) {
      const st = query.state.data?.status;
      if (!st || !TERMINAL.has(st)) return 3000; // poll every 3s
      return false; // stop polling on terminal state
    },
  });

  const currentStatus = statusQuery.data?.status;
  const paymentLink = checkout.data?.payment_link ?? statusQuery.data?.payment_link;
  const isTerminal = currentStatus ? TERMINAL.has(currentStatus) : false;

  const activeIdx = currentStatus ? STEP_ORDER.indexOf(currentStatus) : -1;
  const isError =
    checkout.isError || currentStatus === "pay_fail" || currentStatus === "cancelled";

  /* ---- Empty cart (before any checkout) ---- */
  if (items.length === 0 && !velafiOrderId) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-3xl font-bold text-brand">Pago</h1>
        <p className="mt-4 text-neutral-500">Tu carrito está vacío.</p>
        <button
          onClick={() => router.push("/marketplace")}
          className="mt-4 rounded bg-brand px-6 py-2 text-white hover:bg-brand-dark"
        >
          Ir al mercado
        </button>
      </main>
    );
  }

  /* ---- Empty cart (after a successful checkout that cleared it) ---- */
  if (items.length === 0 && velafiOrderId && checkout.isSuccess) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-3xl font-bold text-brand">Pago</h1>
        {renderPaymentFlow()}
      </main>
    );
  }

  /* ======== RENDER ======== */
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold text-brand">Pago</h1>

      {!velafiOrderId ? renderForm() : renderPaymentFlow()}
    </main>
  );

  /* ---------------------------------------------------------------- */
  /*  Step 1 — Cart summary + payment method + confirm                */
  /* ---------------------------------------------------------------- */
  function renderForm() {
    return (
      <>
        {/* Cart summary */}
        <section className="mt-6 rounded-lg border bg-white p-4">
          <h2 className="text-lg font-semibold">Resumen del pedido</h2>
          <ul className="mt-3 space-y-2">
            {items.map((item) => (
              <li
                key={item.product_id}
                className="flex justify-between text-sm"
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
          <div className="mt-3 flex justify-between border-t pt-3 font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </section>

        {/* Payment method toggle */}
        <section className="mt-4">
          <p className="text-sm font-medium text-neutral-600">
            Método de pago
          </p>
          <div className="mt-2 flex gap-3">
            <button
              onClick={() => setPaymentMethod("fiat_to_fiat")}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                paymentMethod === "fiat_to_fiat"
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400"
              }`}
            >
              Pesos (COP)
            </button>
            <button
              onClick={() => setPaymentMethod("stablecoin")}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                paymentMethod === "stablecoin"
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400"
              }`}
            >
              Stablecoin (USDC)
            </button>
          </div>
        </section>

        {/* TD-2 info note */}
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-neutral-100 p-3 text-xs text-neutral-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            El pago se captura al confirmar el pedido y se libera al agricultor
            cuando el pedido es marcado como <strong>Recolectado</strong>.
          </span>
        </div>

        {/* Confirm */}
        <button
          onClick={() => checkout.mutate()}
          disabled={checkout.isPending}
          className="mt-4 w-full rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {checkout.isPending ? "Procesando pago..." : "Confirmar pago"}
        </button>

        {checkout.isError && (
          <p className="mt-3 text-sm text-red-600">
            Error al iniciar el pago: {checkout.error.message}
          </p>
        )}
      </>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Step 2 — Payment link + status stepper                          */
  /* ---------------------------------------------------------------- */
  function renderPaymentFlow() {
    return (
      <div className="mt-6 space-y-6">
        {/* Payment link — shown while still paying */}
        {currentStatus === "paying" && paymentLink && (
          <div className="rounded-lg border border-brand bg-brand/5 p-4">
            <p className="text-sm font-medium text-brand">
              Abre el siguiente enlace para completar el pago:
            </p>
            <a
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-2 rounded bg-white px-4 py-2 text-brand underline transition-colors hover:bg-brand/5"
            >
              <ExternalLink className="h-4 w-4" />
              Ir a pagar
            </a>
          </div>
        )}

        {/* Status stepper */}
        <div className="rounded-lg border bg-white p-4">
          <h2 className="text-lg font-semibold">Estado del pedido</h2>
          <div className="mt-4 space-y-0">
            {STEP_ORDER.map((st, i) => {
              const isActive = i === activeIdx;
              const isDone = i < activeIdx;
              return (
                <div key={st} className="flex items-start gap-3">
                  {/* Circle icon */}
                  <div className="flex shrink-0 flex-col items-center">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        isDone
                          ? "bg-brand text-white"
                          : isActive
                          ? "border-2 border-brand text-brand"
                          : "border-2 border-neutral-300 text-neutral-400"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : isActive ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    {/* connector line (skip last) */}
                    {i < STEP_ORDER.length - 1 && (
                      <div
                        className={`mt-1 h-6 w-0.5 ${
                          isDone ? "bg-brand" : "bg-neutral-200"
                        }`}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div className="pb-6 pt-1">
                    <span
                      className={`text-sm ${
                        isDone
                          ? "text-neutral-500"
                          : isActive
                          ? "font-semibold text-brand"
                          : "text-neutral-400"
                      }`}
                    >
                      {STATUS_LABELS[st]}
                    </span>
                    {isActive && currentStatus === "paying" && (
                      <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pay-fail state */}
        {currentStatus === "pay_fail" && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">El pago falló</span>
            </div>
            <p className="mt-1">
              Intenta de nuevo o contacta a tu banco si el problema persiste.
            </p>
            <button
              onClick={() => {
                setVelafiOrderId(null);
                checkout.reset();
              }}
              className="mt-2 font-medium text-red-700 underline"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Cancelled state */}
        {currentStatus === "cancelled" && (
          <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Pedido cancelado</span>
            </div>
          </div>
        )}

        {/* Delivered success */}
        {currentStatus === "delivered" && (
          <div className="rounded-lg border border-brand bg-brand/5 p-4">
            <div className="flex items-center gap-2 text-brand">
              <Package className="h-5 w-5" />
              <span className="font-semibold">¡Pedido entregado!</span>
            </div>
            <p className="mt-1 text-sm text-neutral-600">
              El pago ya fue liberado al agricultor.
            </p>
          </div>
        )}

        {/* Collect note (TD-2: release-on-collected) */}
        {currentStatus === "collected" && (
          <div className="flex items-start gap-2 rounded-lg bg-purple-50 p-3 text-xs text-purple-700">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              El pedido fue recolectado por el agricultor. El pago se liberará
              cuando el pedido sea marcado como <strong>Entregado</strong>.
            </span>
          </div>
        )}

        {/* Polling indicator */}
        {!isTerminal && !checkout.isPending && (
          <p className="animate-pulse text-center text-xs text-neutral-400">
            Actualizando estado...
          </p>
        )}

        {/* Loading spinner for initial status fetch */}
        {statusQuery.isLoading && (
          <p className="text-center text-sm text-neutral-500">
            Consultando estado del pago...
          </p>
        )}

        {/* Action buttons on terminal states */}
        {isTerminal && (
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/orders")}
              className="flex-1 rounded-lg border border-brand px-4 py-2 text-center text-sm font-medium text-brand hover:bg-brand/5"
            >
              Mis pedidos
            </button>
            <button
              onClick={() => {
                clearCart();
                router.push("/marketplace");
              }}
              className="flex-1 rounded-lg bg-brand px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-dark"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    );
  }
}
