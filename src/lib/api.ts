import type {
  AuthResponse,
  CartItemInput,
  CheckoutRequest,
  ConsumerProfileInput,
  FarmerProfileInput,
  LoginInput,
  Order,
  PaymentCheckoutBody,
  PaymentCheckoutResponse,
  Product,
  ProductInput,
  SignupInput,
  User,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Low-level fetch wrapper
// ---------------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Typed convenience wrappers
// ---------------------------------------------------------------------------

/** GET /products — list with optional filters. */
export function getProducts(
  params?: { q?: string; category?: string; department?: string },
): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.category) qs.set("category", params.category);
  if (params?.department) qs.set("department", params.department);
  const query = qs.toString();
  return apiFetch<Product[]>(`/products${query ? `?${query}` : ""}`);
}

/** GET /products/:id */
export function getProduct(id: number | string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

/** POST /products — create a new product (farmer only). */
export function createProduct(payload: ProductInput): Promise<Product> {
  return apiFetch<Product>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Auth ──────────────────────────────────────────────────────────────

/** POST /auth/login */
export function login(payload: LoginInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** POST /auth/signup */
export function signup(payload: SignupInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** GET /auth/me */
export function getMe(): Promise<User> {
  return apiFetch<User>("/auth/me");
}

// ─── Cart / Checkout / Orders ──────────────────────────────────────────

/** POST /orders — place an order (consumer only). */
export function checkout(
  items: CartItemInput[],
): Promise<Order> {
  const body: CheckoutRequest = { items };
  return apiFetch<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /orders/mine — current consumer's orders. */
export function getMyOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/orders/mine");
}

/** GET /orders/farmer — orders containing this farmer's products. */
export function getFarmerOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/orders/farmer");
}

// ─── Payments ──────────────────────────────────────────────────────────

/** POST /payments/checkout — create a payment for an order. */
export function createPayment(
  payload: PaymentCheckoutBody,
): Promise<PaymentCheckoutResponse> {
  return apiFetch<PaymentCheckoutResponse>("/payments/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Profiles ──────────────────────────────────────────────────────────

/** POST /farmers/me — upsert farmer profile. */
export function upsertFarmerProfile(
  payload: FarmerProfileInput,
): Promise<FarmerProfileInput & { user_id: number }> {
  return apiFetch("/farmers/me", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** GET /farmers/me */
export function getFarmerProfile(): Promise<
  FarmerProfileInput & { user_id: number }
> {
  return apiFetch("/farmers/me");
}

/** POST /consumers/me — upsert consumer profile. */
export function upsertConsumerProfile(
  payload: ConsumerProfileInput,
): Promise<ConsumerProfileInput & { user_id: number }> {
  return apiFetch("/consumers/me", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** GET /consumers/me */
export function getConsumerProfile(): Promise<
  ConsumerProfileInput & { user_id: number }
> {
  return apiFetch("/consumers/me");
}

export { API_URL, apiFetch };
