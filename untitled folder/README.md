# Vibe Commerce - Mock Cart

This repository contains a small full-stack mock e-commerce cart used for screening tasks.

Features
- Backend: Express + SQLite (server)
  - GET /api/products
  - POST /api/cart
  - POST /api/cart/:id (update qty)
  - DELETE /api/cart/:id
  - GET /api/cart
  - POST /api/checkout
- Frontend: React + Vite (client)
  - Products grid, Add to cart
  - Cart view: update qty, remove, view total
  - Checkout form (mock receipt)

Quick start

1. Install and run server

```bash
cd server
npm install
npm run start
```

Server runs on port 4000.

2. Install and run client

```bash
cd ../client
npm install
npm run dev
```

Client runs on port 3000 and proxies /api to the server.

Notes & extras
- The backend uses SQLite and seeds sample products automatically.
- The checkout is mocked (no real payments). After checkout, the cart is cleared and a receipt object is returned.
- Bonus features included:
  - Mock users table and endpoints (`POST /api/users`, `GET /api/users/:id`) and cart is user-scoped (use `userId` query/body).
  - Optional Fake Store integration: set environment `USE_FAKE_STORE=true` before starting the server to fetch products from https://fakestoreapi.com (falls back to local DB on failure).
  - Basic API tests with Jest + Supertest are included under `server/test`.


