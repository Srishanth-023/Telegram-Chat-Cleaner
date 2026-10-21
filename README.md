# Telegram Chat Cleaner

> **Secure, client-only web application to bulk-remove unwanted conversations from your personal Telegram account: never deleting messages for the other party.**

Telegram Chat Cleaner runs entirely in your web browser. Connections are established directly to Telegram's MTProto servers over WebSockets using [GramJS](https://github.com/gram-js/gramjs). There is **no backend**, **no database**, and **no server-side session storage**. The host serves only static files.

---

## Core Security & Privacy Promise

> **"Your API credentials, login code, password, and session never leave your browser, and nothing is removed without your explicit confirmation."**

1. **Client-Only Architecture**: Zero API routes, zero backend databases, zero analytics, zero error-reporting SDKs, and zero third-party tracking scripts.
2. **Direct Browser Connection**: All network traffic flows strictly between your browser and Telegram's official WebSocket endpoints (`wss://*.web.telegram.org`).
3. **No Revocation (`revoke: false`)**: Conversations are removed solely from your personal Telegram account view. Other participants, group members, and channel subscribers retain their complete message history.
4. **Zero-Secret Logging**: Credentials (`api_hash`, phone numbers, SMS codes, 2FA passwords, session strings) are strictly prohibited from console logs, URLs, query parameters, and unencrypted local storage. Enforced via automated unit tests.
5. **Encrypted Optional Persistence**: Sessions are kept strictly in browser memory by default. If "Remember me" is opted in, session strings are encrypted using AES-GCM with a non-extractable WebCrypto key stored in browser IndexedDB, with an automatic TTL expiration.

---

## Features

- **Direct MTProto over WebSocket**: Connects directly to Telegram using GramJS with automated retry and keep-alive handling.
- **Guided Authentication Stepper**: 4-step wizard for API credentials, international phone verification, 5-digit login code, and optional Cloud Password (2FA).
- **Comprehensive Dialog Fetcher**: Paginates through all active and archived chats (folders 0 and 1) without artificial caps.
- **Virtualized High-Performance Chat List**: Smoothly renders lists with 2,000+ conversations using `@tanstack/react-virtual`.
- **Intelligent Filtering & Sorting**: Filter by type (*Private*, *Bots*, *Groups*, *Supergroups*, *Channels*) or folder (*All*, *Active*, *Archived*), with search by name and `@username`, and sorting by recent activity or title.
- **Protected Chats Invariant**: *Saved Messages* and the official *Telegram Service Notifications* (777000) are hard-coded as protected and cannot be deleted.
- **Two-Step Destructive Confirmation**: Review grouped chats with danger callouts for owned groups, requiring both an explicit acknowledgment checkbox and typing the confirmation word `REMOVE`.
- **Sequential Rate-Limited Removal Engine**: Executes one chat at a time with a configurable delay (~400 ms), live countdown on `FloodWaitError`, pause/resume, and graceful cancellation via `AbortController`.
- **Audit Log & Summary Export**: Live operation stream with status badges, retry for failed items, and client-side CSV summary download.
- **15-Minute Inactivity Auto-Lock**: Automatically disconnects and wipes in-memory credentials after 15 minutes of inactivity, with a 60-second warning toast.

---

## Technology Stack

| Layer | Choice | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 14.2 (App Router) | Configured with `output: 'export'` for 100% static compilation |
| **Telegram Protocol** | GramJS (`telegram` v2.26.22) | Browser MTProto client over WebSocket transport |
| **Bundling Polyfills** | Webpack 5 fallbacks | Buffer and process polyfilled for browser runtime compatibility |
| **Styling** | Tailwind CSS & CSS Variables | Curated light theme tokens with high-contrast accessibility (WCAG 2.2 AA) |
| **UI Primitives** | Radix UI | Accessible Dialog, Checkbox, Tooltip, Progress, Stepper, and Toast |
| **State Management** | Zustand (v5) | In-memory reactive state; zero persistent storage by default |
| **List Virtualization** | `@tanstack/react-virtual` | DOM virtualization for high-throughput chat feeds |
| **Validation** | Zod (v3) | Schema validation for credentials, phone numbers, and codes |
| **Testing** | Vitest + Testing Library + Playwright | 12 test suites, unit tests, component tests, and E2E specs |

---

## Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/Srishanth-023/Telegram-Chat-Cleaner.git
cd Telegram-Chat-Cleaner

# Install dependencies (pinned exact versions)
npm install
```

### Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Verification

Run all test suites and quality gates:

```bash
# Typecheck TypeScript strict mode
npm run typecheck

# Lint with Next.js ESLint configuration
npm run lint

# Run Vitest unit & component test suite
npm test

# Run Playwright E2E integration test suite
npm run test:e2e

# Run production static build export
npm run build
```

---

## How to Get Your Telegram API Credentials

To connect directly to the Telegram MTProto API, you must provide your own API credentials:

1. Visit **[my.telegram.org](https://my.telegram.org)** and log in using your Telegram phone number.
2. Navigate to **API development tools**.
3. Create a new application (enter an App title and Short name, e.g. "MyChatCleaner").
4. Copy your numeric **App API ID (`api_id`)** and 32-character hexadecimal **App API Hash (`api_hash`)**.
5. Paste them into the application's Connect stepper.

---

## Production Deployment

Because Telegram Chat Cleaner compiles to static assets (`output: 'export'`), it can be hosted on any static hosting provider.

### Vercel
Deploy directly via GitHub repository. Security headers (CSP, HSTS, X-Frame-Options) are pre-configured in `vercel.json`.

### Netlify / Cloudflare Pages / GitHub Pages
Static headers are provided in `public/_headers` and will automatically be applied upon deployment.

```bash
# Output directory generated by static build
./out
```

---

## Disclaimer & License

This is an unofficial open-source utility developed under the MIT License. It communicates directly with Telegram servers using official MTProto APIs. This project is not affiliated with, authorized, maintained, sponsored, or endorsed by Telegram FZ-LLC or any of its affiliates. Always comply with [Telegram's Terms of Service](https://telegram.org/tos).

Licensed under the **[MIT License](LICENSE)**.
