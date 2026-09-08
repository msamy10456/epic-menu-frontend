# Epicwall Menu — frontend

React (Vite + TypeScript) dashboard and public menu for the Epicwall Menu SaaS.

## Prerequisites

- Node.js 20+
- The Laravel API running at `http://127.0.0.1:8000`

Vite proxies `/api` and `/storage` to that backend during local development.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app starts at [http://localhost:5173](http://localhost:5173).

## Environment

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | API base URL. Default in `.env.example`: `http://127.0.0.1:8000/api`. Axios falls back to `/api` (the Vite proxy) if unset. |

## Scripts

- `npm run dev` — Vite on port 5173
- `npm run build` — typecheck and production build
- `npm run preview` — preview the production build
