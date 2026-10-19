# F1 & MotoGP Live Schedule

A fast, real-time web app for tracking Formula 1 and MotoGP schedules. Built with **Astro**, **Svelte**, **Tailwind CSS**, and **Hono.js**.

## Features

- 🏎️ **Live Data**: Syncs directly with OpenF1 and MotoGP APIs.
- ⚡ **Real-Time Countdowns**: Uses Server-Sent Events (SSE) for live session tracking.
- 🚀 **Fast & Lightweight**: Built with Astro Islands for minimal JavaScript overhead.
- 🛡️ **Zero-Config Fallbacks**: Runs instantly via direct API fetching and in-memory cache if a database isn't available.

## Requirements

- **Node.js**: v18+ (v20 recommended)
- **npm**: v9+
*(Docker is not required)*
<br>

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
