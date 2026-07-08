# MercadoDirecto — Frontend

Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui marketplace UI for
connecting Colombian farmers directly with consumers.

## Stack
- **Next.js 14** (App Router, RSC)
- **TypeScript** (strict)
- **Tailwind CSS** + **shadcn/ui** (Radix)
- **TanStack Query** for data fetching
- **JWT auth** via httpOnly cookie (set by backend on login)

## Setup
```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```

## Routes
| Route | Purpose |
|-------|---------|
| `/login`, `/signup` | auth (role picker) |
| `/marketplace` | product browse + filters |
| `/products/[id]` | product detail + add to cart |
| `/cart` | cart |
| `/checkout` | place order |
| `/orders` | consumer order history |
| `/farmer/dashboard` | farmer listings + incoming orders |
| `/consumer/dashboard` | consumer recent orders |
| `/farmer/profile`, `/consumer/profile` | profile edit |

## API client
See `lib/api.ts` — wraps fetch with credentials, attaches to `NEXT_PUBLIC_API_URL`.
