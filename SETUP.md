# Project Setup & Build Guide (`SETUP.md`)

This guide walks you through setting up, running locally, and building **Telegram Chat Cleaner** for production static deployment.

---

## Prerequisites

Before you begin, ensure your machine has:

- **Node.js**: `18.x` or `20.x` (LTS recommended)
- **npm**: `9.x` or `10.x` (installed automatically with Node.js)
- **Git**: Installed and available in your terminal
- **Telegram Account**: With access to phone verification (SMS or Telegram in-app code)
- **Modern Web Browser**: Chrome, Edge, Firefox, Brave, or Safari with WebCrypto & WebSocket support

---

## Step 1: Telegram API Credentials

Because Telegram Chat Cleaner connects directly from your browser to Telegram's MTProto servers via WebSocket, you need your own Telegram App API credentials:

1. Visit **[my.telegram.org](https://my.telegram.org)** in your browser.
2. Sign in with your Telegram account's international phone number (e.g. `+1 555 123 4567`).
3. Enter the login confirmation code sent to your Telegram app.
4. Navigate to **API development tools**.
5. Create a new application:
   - **App title**: e.g., `MyChatCleaner`
   - **Short name**: e.g., `chatcleaner`
   - **Platform**: `Desktop` or `Web`
   - **Description**: (can be brief or left default)
6. Note down the two generated credentials:
   - **`App api_id`**: A numeric string (e.g., `12345678`)
   - **`App api_hash`**: A 32-character hexadecimal string (e.g., `0123456789abcdef0123456789abcdef`)

> [!NOTE]
> These credentials remain strictly inside your browser session and are never transmitted to any external server or backend.

---

# SET-UP (Separate Phase)

Follow these steps to prepare your local development environment:

### 1. Clone the Repository

```bash
git clone https://github.com/Srishanth-023/Telegram-Chat-Cleaner.git
cd Telegram-Chat-Cleaner
```

### 2. Install Pinned Dependencies

All dependencies are strictly pinned to exact versions in `package.json` to prevent transitive breaking changes.

```bash
npm install
```

> [!TIP]
> Do not use `npm update` or change pinned version specifiers in `package.json`.

### 3. Verify Environment Integrity

Run the static validation and test gates to confirm your installation is functioning:

```bash
# 1. Check TypeScript types in strict mode
npm run typecheck

# 2. Check ESLint code style and quality rules
npm run lint

# 3. Run all unit and component test suites (39 tests)
npm test
```

If all three commands exit with code `0`, your setup is complete and ready.

---

# RUNNING LOCALLY (Development Mode)

### 1. Start the Development Server

```bash
npm run dev
```

The Next.js development server will start at:
**[http://localhost:3000](http://localhost:3000)**

### 2. Using the Application

1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Click **"Get Started"** or navigate to **`/connect`**.
3. Enter your **`api_id`** and **`api_hash`** from Step 1.
4. Enter your international phone number, then input the 5-digit verification code sent by Telegram.
5. If your account has Two-Step Verification (Cloud Password) enabled, enter your password.
6. Once connected, the application navigates to the **`/dashboard`** to load your active and archived dialogs.
7. Select unwanted chats, review consequences on **`/review`**, and confirm deletion with the two-part safety gate.

> [!TIP]
> The app runs purely in-memory by default. Refreshing the browser tab wipes credentials from memory unless you explicitly enable **"Remember me on this device"** (which encrypts the session with AES-GCM in IndexedDB).

---

# BUILD (Separate Phase)

Telegram Chat Cleaner is configured as a **100% static client-side export** (`output: 'export'` in `next.config.js`). It builds into pure static HTML, CSS, and JS bundles with zero server-side dependencies.

### 1. Generate Production Static Build

```bash
npm run build
```

This executes:
1. TypeScript strict typechecking
2. Next.js static asset compilation and bundling with Webpack fallbacks for GramJS
3. Static page generation for:
   - `/` (Onboarding / Landing)
   - `/connect` (Authentication Stepper)
   - `/dashboard` (Virtualized Chat List)
   - `/review` (Destructive Confirmation Gate)
   - `/progress` (Execution Engine & Audit Log)
   - `/_not-found` (404 Page)
4. Exports all static output to the `./out` directory.

### 2. Preview the Production Build Locally

To test the compiled production static bundle locally before deploying:

```bash
# Serve the compiled ./out directory using a lightweight HTTP server
npx serve out -p 3000
```
Open [http://localhost:3000](http://localhost:3000) to test the production bundle.

---

## Deploying the Production Static Build

The `./out` directory contains standard static files that can be deployed to any static host:

### Deploy to Vercel
Security headers are already configured in `vercel.json`:
```bash
npx vercel deploy --prod
```

### Deploy to Cloudflare Pages / Netlify / GitHub Pages
Security headers (`Content-Security-Policy`, `HSTS`, `X-Frame-Options`, `Referrer-Policy`) are pre-configured in `public/_headers` and copied directly to `out/_headers`:
- **Cloudflare Pages**: Set build command `npm run build` and output directory `out`.
- **Netlify**: Set build command `npm run build` and publish directory `out`.
- **GitHub Pages**: Upload the contents of `./out` or configure a GitHub Action to deploy `./out`.

---

## Summary of All Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts local Next.js dev server on `http://localhost:3000` |
| `npm run typecheck` | Validates TypeScript in strict mode without emitting files |
| `npm run lint` | Runs Next.js ESLint to verify code quality and dependencies |
| `npm test` | Runs the Vitest test suite (unit and component tests) |
| `npm run test:watch` | Runs Vitest in interactive watch mode for TDD |
| `npm run test:e2e` | Runs Playwright integration specs against the web server |
| `npm run build` | Compiles and exports the 100% static site into `./out` |
