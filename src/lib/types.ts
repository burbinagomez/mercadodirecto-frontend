// ---------------------------------------------------------------------------
// Shared TypeScript types mirroring the FastAPI backend Pydantic schemas.
// Single source of truth for frontend–backend contract. No codegen required.
// ---------------------------------------------------------------------------

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  role: UserRole;
}

export type UserRole = "farmer" | "consumer" | "restaurant";

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  role: UserRole;
}

/** Response from POST /auth/login and POST /auth/signup. */
export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// ─── Profiles ──────────────────────────────────────────────────────────────

export interface FarmerProfileInput {
  farm_name: string;
  department: string;
  city: string;
  bio?: string;
  produces?: string;
}

export interface ConsumerProfileInput {
  full_name?: string;
  address?: string;
}

// ─── Products ──────────────────────────────────────────────────────────────

/** Matches backend ProductOut schema. */
export interface Product {
  id: number;
  farmer_id: number;
  name: string;
  category: string;
  price_per_kg: number;
  unit: string;
  quantity_available: number;
  harvest_date: string | null;
  image_urls: string[];
  department: string;
}

/** Payload for creating a new product. */
export interface ProductInput {
  name: string;
  category: string;
  price_per_kg: number;
  unit?: string;
  quantity_available?: number;
  harvest_date?: string | null;
  image_urls?: string[];
  department?: string;
}

// ─── Cart / Checkout ───────────────────────────────────────────────────────

/** Single item in a checkout request (POST /orders). */
export interface CartItemInput {
  product_id: number;
  qty: number;
}

/** POST /orders body. */
export interface CheckoutRequest {
  items: CartItemInput[];
}

/** Cart item shape used by order lists / detail. */
export interface CartItem {
  product_id: number;
  name: string;
  quantity: number;
  price_per_kg: number;
  unit: string;
}

/** In-memory cart (cart-context). */
export interface Cart {
  items: CartItem[];
  total: number;
}

// ─── Orders ────────────────────────────────────────────────────────────────

/** Single line in an order (backend OrderItemOut). */
export interface OrderItem {
  product_id: number;
  qty: number;
  price: number;
}

/** Order creation payload (POST /orders). */
export interface OrderItemIn {
  product_id: number;
  qty: number;
}

export interface CreateOrderRequest {
  items: OrderItemIn[];
}

export interface OrderCreated {
  id: number;
  consumer_id: number;
  status: string;
  total: number;
}

/** Backend order status values (used for checkout polling). */
export type OrderStatus =
  | "paying"
  | "paid"
  | "scheduled"
  | "collected"
  | "delivered"
  | "pay_fail"
  | "cancelled";

/** Matches backend OrderOut schema. */
export interface Order {
  id: number;
  velafi_order_id: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  items: CartItem[];
}

// ─── Payments ──────────────────────────────────────────────────────────────

/** Payment method: Mono (PSE fiat) or stablecoin (VelaFi). */
export type PaymentMethod = "mono" | "stablecoin";
export type PaymentStatus = "created" | "paid" | "failed" | "refunded";

/** POST /payments/checkout body. */
export interface PaymentCheckoutBody {
  order_id: number;
  method?: PaymentMethod;
  /* stablecoin (VelaFi) fields */
  wallet_id?: number | null;
  currency?: string;
}

/** PSE (Mono) checkout body. */
export interface CheckoutBody {
  order_id: number;
  method: PaymentMethod;
}

/** Successful response for Mono (PSE) checkout. */
export interface PaymentMonoResponse {
  method: "mono";
  redirectUrl: string;
  reference: string;
}

/** Successful response for stablecoin (VelaFi) checkout. */
export interface PaymentStablecoinResponse {
  method: "stablecoin";
  paymentLink: string;
  reference: string;
}

/** Checkout response (mono | stablecoin). */
export type CheckoutResponse = PaymentMonoResponse | PaymentStablecoinResponse;

/** Backend-compatible alias. */
export type PaymentCheckoutResponse = CheckoutResponse;

/** Order status used for checkout polling until PAID. */
export interface OrderStatusResponse {
  status: OrderStatus;
  payment_link?: string;
}
