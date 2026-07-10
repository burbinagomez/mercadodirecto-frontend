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

/** Single item in a checkout request. */
export interface CartItemInput {
  product_id: number;
  qty: number;
}

/** POST /orders body. */
export interface CheckoutRequest {
  items: CartItemInput[];
}

// ─── Orders ────────────────────────────────────────────────────────────────

/** Single line in an order. */
export interface OrderItem {
  product_id: number;
  qty: number;
  price: number;
}

/** Matches backend OrderOut schema. */
export interface Order {
  id: number;
  consumer_id: number;
  status: string;
  total: number;
  items: OrderItem[];
}

// ─── Payments ──────────────────────────────────────────────────────────────

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

/** Successful response for stablecoin (VelaFi) checkout. */
export interface PaymentStablecoinResponse {
  method: "stablecoin";
  paymentLink: string;
  reference: string;
}

/** Successful response for Mono (PSE) checkout. */
export interface PaymentMonoResponse {
  method: "mono";
  redirectUrl: string;
  reference: string;
}

export type PaymentCheckoutResponse =
  | PaymentMonoResponse
  | PaymentStablecoinResponse;

/** Order status used for checkout polling until PAID. */
export type OrderStatus =
  | "paying"
  | "paid"
  | "scheduled"
  | "collected"
  | "delivered"
  | "pay_fail"
  | "cancelled";

export interface OrderStatusResponse {
  status: OrderStatus;
  payment_link?: string;
}
