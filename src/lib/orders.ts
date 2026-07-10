import { apiFetch } from "@/lib/api";
import type {
  CartItem,
  CheckoutResponse,
  Order,
  OrderCreated,
  OrderStatusResponse,
  PaymentMethod,
} from "@/lib/types";

/**
 * Create an order from cart items (POST /orders).
 * Returns the created order with its id, which is then used for checkout.
 */
export async function createOrder(items: CartItem[]): Promise<OrderCreated> {
  return apiFetch<OrderCreated>("/orders", {
    method: "POST",
    body: JSON.stringify({
      items: items.map((i) => ({ product_id: i.product_id, qty: i.quantity })),
    }),
  });
}

/**
 * Initiate a payment checkout (POST /payments/checkout).
 *
 * @param orderId  The id returned from createOrder().
 * @param method   "mono" (PSE bank redirect) or "stablecoin" (VelaFi crypto).
 *
 * For method="mono" the response includes `redirectUrl` — the caller should
 * redirect the browser to that URL for the user to authenticate at their bank.
 */
export async function createCheckout(
  orderId: number,
  method: PaymentMethod = "mono",
): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>("/payments/checkout", {
    method: "POST",
    body: JSON.stringify({ order_id: orderId, method }),
  });
}

/**
 * Poll the status of an order (used after returning from bank redirect).
 */
export async function getOrderStatus(
  orderId: number,
): Promise<OrderStatusResponse> {
  return apiFetch<OrderStatusResponse>(`/orders/${orderId}/status`);
}

/**
 * List all orders for the current user.
 */
export async function listOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/orders/mine");
}
