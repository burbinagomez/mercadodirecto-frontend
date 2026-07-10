import { apiFetch } from "@/lib/api";
import type {
  CartItem,
  CheckoutResponse,
  Order,
  OrderStatusResponse,
  PaymentMethod,
} from "@/lib/types";

export async function createCheckout(
  items: CartItem[],
  paymentMethod: PaymentMethod = "fiat_to_fiat",
): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>("/payments/checkout", {
    method: "POST",
    body: JSON.stringify({ items, payment_method: paymentMethod }),
  });
}

export async function getOrderStatus(
  velafiOrderId: string,
): Promise<OrderStatusResponse> {
  return apiFetch<OrderStatusResponse>(
    `/payments/order/${velafiOrderId}/status`,
  );
}

export async function listOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/payments/orders");
}
