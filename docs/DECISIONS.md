# Architectural & Implementation Decisions

This document records all architectural choices, assumptions, and deviations from defaults, along with their rationale.

## 1. Pinned Dependencies
- All runtime and dev dependencies are pinned to exact semantic versions (no `^` or `~`) in `package.json` with a committed lockfile.
- Framework: Next.js 14.2.24 with React 18.3.1 for stability with Radix UI primitives and static export mode (`output: 'export'`).
- Telegram Client: `telegram` (GramJS) version 2.26.22.

## 2. Bundling & Browser Polyfills (GramJS Webpack Fallbacks) - Confirmed Working
- GramJS targets Node.js and depends on Node primitives (`Buffer`, `process`, `stream`, `crypto`, etc.).
- The verified working configuration in `next.config.js`:
  ```javascript
  const webpack = require("webpack");
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    output: "export",
    trailingSlash: true,
    images: { unoptimized: true },
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
          path: false,
          os: false,
          crypto: false,
          stream: false,
          buffer: require.resolve("buffer/"),
          process: require.resolve("process/browser"),
        };
        config.plugins.push(
          new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
            process: "process/browser",
          })
        );
      }
      return config;
    },
  };
  module.exports = nextConfig;
  ```
- All client components importing GramJS are dynamically loaded with `{ ssr: false }`, ensuring static export build succeeds and browser WebSocket connectivity executes purely client-side without SSR hydration errors.
- Verified: `npm run typecheck`, `npm test`, and `npm run build` all pass with code 0.

## 3. Typings Verification vs Prompt Specification
- GramJS API methods were cross-referenced with `node_modules/telegram/tl/api.d.ts`:
  - `Api.messages.DeleteHistory`: accepts `{ peer, maxId, revoke: false, justClear }` and returns `messages.AffectedHistory` with `offset: number` for iterative draining.
  - `Api.messages.DeleteChatUser`: accepts `{ chatId, userId: 'me', revokeHistory: false }` and returns `Api.TypeUpdates`.
  - `Api.channels.LeaveChannel`: accepts `{ channel }` and returns `Api.TypeUpdates`.
  - `Api.auth.LogOut`: accepts no arguments and logs out the current session.
  - `errors.FloodWaitError`: exposes `seconds: number`.
  - `client.getDialogs` / `client.iterDialogs`: accepts `{ folder: 0 }` for main dialogs and `{ folder: 1 }` (or `archived: true`) for archived dialogs.

## 4. WebCrypto AES-GCM IndexedDB Vault
- Persistent storage is strictly opt-in ("Remember me on this device").
- Default mode keeps the GramJS session in JavaScript memory only.
- Encrypted vault uses `window.crypto.subtle.generateKey` with `{ name: "AES-GCM", length: 256 }` and `extractable: false`.
- The non-extractable key is stored in the `crypto_keys` IndexedDB store, while ciphertext and a fresh 12-byte random IV are stored in `encrypted_vault`.
- Expiry TTL (1 hour, 24 hours, or 7 days) is validated on retrieval. Expired sessions are wiped immediately.

## 5. Sequential Removal Queue & FloodWait Mitigation
- Removals are strictly sequential; two removals never run concurrently.
- Configurable inter-item delay (~400 ms) prevents rapid bursting.
- GramJS `FloodWaitError` instances are intercepted to extract `seconds`, transitioning the queue to a waiting state with a live decrementing UI countdown before retrying the same item up to 3 times.
- Full cancellation uses standard `AbortController` semantics.
- Beforeunload browser protection prevents accidental tab closing mid-run.

## 6. Radix UI & Testing Environment Polyfills
- Radix UI Checkbox internally depends on `@radix-ui/react-use-size` which invokes `ResizeObserver`.
- In Vitest's jsdom environment, `global.ResizeObserver` is stubbed in `src/test/setup.ts` to allow headless component rendering without crashing.

## 7. Build & Static Export Verification
- Verified: `npm run typecheck` (zero TypeScript errors).
- Verified: `npm run lint` (zero ESLint errors, zero warnings).
- Verified: `npm test` (12 test suites, 35 tests passing).
- Verified: `npm run build` (`next build` static export generating static HTML pages in `out/`).

