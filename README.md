# Real-Time Formula 1 & MotoGP Schedule Platform

A modern, high-performance web application that serves as a premium real-time motorsport scheduling platform for Formula 1 and MotoGP.

Built with **Astro**, **Svelte**, **Tailwind CSS**, and **Hono.js**.

## Features

- 🏎️ **Live Data Integration**: Automatic synchronization with OpenF1 and MotoGP providers.
- ⚡ **Real-Time Updates**: Uses Server-Sent Events (SSE) for live session countdowns.
- 🎨 **Neo-Minimalist Design**: Premium user interface with micro-interactions and smooth transitions.
- 🚀 **High Performance**: Built with Astro Islands for minimal JavaScript overhead.
- 🛡️ **Graceful Degradation**: Optional PostgreSQL and Redis integration. Fully runs natively via API fallbacks.

## Requirements

- **Node.js**: v18+ (v20 recommended)
- **npm**: v9+

*Note: Docker is NOT required to run this project.*

## Installation

1. **Clone the repository**
2. **Install all dependencies** from the root folder:
   ```bash
   npm install
   ```

## Environment Variables

Copy the example environment file in the backend:

```bash
cp backend/.env.example backend/.env
```

The application runs perfectly in **Development Mode** without setting any variables. It will automatically fallback to an in-memory cache and direct API provider fetching.

### Optional Services (Production Mode)

To enable persistent storage or distributed caching:
- `DATABASE_URL`: Add your PostgreSQL connection string.
- `REDIS_URL`: Add your Redis cache URL.

## Running Locally

You can launch both the frontend and backend simultaneously using a single command:

```bash
npm run start:all
```

Alternatively, you can run them in separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Once running, navigate to `http://localhost:4321` to view the platform.

## Troubleshooting

- **Redis Error**: If the backend console warns about Redis being unavailable, it will automatically fallback to an in-memory map. The app will not crash.
- **Database Error**: If PostgreSQL is unavailable, Prisma initialization is skipped and the platform fetches schedule data directly via the `F1Provider` and `MotoGPProvider`.
