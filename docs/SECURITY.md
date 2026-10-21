# Security Architecture & Threat Model

Telegram Chat Cleaner is engineered around a strict zero-trust, client-only paradigm. This document details the security posture, threat model, data storage boundaries, static security headers, and session lifecycles.

---

## 1. Core Threat Model

### Adversary Vectors & Mitigations

| Threat Vector | Severity | Mitigation Architecture |
| :--- | :--- | :--- |
| **Server-Side Session Interception** | Critical | **No backend exists.** The application is served as static HTML/JS/CSS. No server-side session stores, databases, or API routes are used. |
| **Credential Theft via Network Eavesdropping** | High | All communication with Telegram is performed directly from the browser to Telegram MTProto servers via WebSocket Secure (`wss://*.web.telegram.org`). Strict HTTPS is required for serving the static assets. |
| **Third-Party Telemetry & Leakage** | High | Zero third-party scripts, CDNs, fonts, analytics, or error-reporting SDKs. Content-Security-Policy enforces `connect-src 'self' wss://*.web.telegram.org https://*.web.telegram.org; default-src 'self';`. |
| **Accidental Message Revocation for Counterparties** | High | Enforced programmatic invariant: every deletion request passes `revoke: false` / `revokeHistory: false`. Tested by automated unit tests (`removal.test.ts`). |
| **Memory Dump & Log Leaks** | Medium | Sensitive values (`api_hash`, phone verification codes, 2FA passwords) are cleared immediately after use and never written to `console.log`. Enforced by automated security test (`security-no-console.test.ts`). |
| **Unattended Device Hijacking** | Medium | Automatic 15-minute inactivity watchdog that disconnects the MTProto client, purges in-memory stores, deletes stored keys, and alerts the user with a 60-second advance toast. |

---

## 2. Data Storage Boundaries

| Secret / Data Point | Storage Medium | Lifetime | Encryption |
| :--- | :--- | :--- | :--- |
| **`api_id`** | JavaScript Memory | Session duration | In-memory only (encrypted if "Remember Me" is enabled) |
| **`api_hash`** | JavaScript Memory | Session duration | In-memory only (never logged, never in URLs) |
| **Phone Number** | Form Memory | Until step completion | Immediately cleared upon code dispatch |
| **Verification Code (SMS)** | Form Memory | Until step completion | Immediately cleared upon submission |
| **2FA Cloud Password** | Form Memory | Until step completion | Immediately cleared upon submission |
| **Session String (Default)** | Module Singleton Memory | Tab close / Refresh | Ephemeral in-memory |
| **Session String ("Remember Me")** | IndexedDB (`tg_cleaner_secure_vault`) | Configurable TTL (1 hr, 24 hrs, 7 days) | **AES-GCM 256-bit** with non-extractable WebCrypto key |

---

## 3. WebCrypto AES-GCM Encrypted Persistence Specification

When the user explicitly checks *"Remember me on this device"*, persistence adheres to:
1. **Key Generation**: A cryptographic key is created using `window.crypto.subtle.generateKey` with `{ name: "AES-GCM", length: 256 }` and `extractable: false`.
2. **IV (Initialization Vector)**: A unique, cryptographically random 12-byte IV is generated per write via `crypto.getRandomValues(new Uint8Array(12))`.
3. **Payload Structure**: `{ sessionString, apiId, apiHash, expiresAt: Date.now() + ttlMs }`.
4. **Key Isolation**: The non-extractable `CryptoKey` is preserved in an isolated IndexedDB object store (`crypto_keys`), while the encrypted payload and IV reside in `encrypted_vault`.
5. **Auto-Purge on Expiration**: Upon loading, if `Date.now() > payload.expiresAt`, the session payload is immediately purged from IndexedDB, and the user must log in afresh.
6. **Explicit Wipe ("Forget Device")**: Users can wipe their device keys and stored session at any time with a single click.

---

## 4. Static HTTP Security Headers

Deployed via `vercel.json` and Netlify/Cloudflare `public/_headers`:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' wss://*.web.telegram.org https://*.web.telegram.org; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

### Content-Security-Policy Rationale
- `default-src 'self'`: Disallows external asset loading by default.
- `connect-src 'self' wss://*.web.telegram.org https://*.web.telegram.org`: Telegram MTProto endpoints are the only allowable external connection targets.
- `frame-ancestors 'none'`: Prevents clickjacking attacks by forbidding embedding in `<iframe>` tags.
- `form-action 'none'`: Prevents native HTML form submissions to external URLs.

---

## 5. Session Lifecycle & Inactivity Watchdog

1. **Active Session**: User interacts with the UI. Keyboard, mouse, touch, and scroll events touch `touchActivity()` in the session store.
2. **Warning Threshold (14 minutes)**: If no interaction is detected for 14 minutes, a high-priority warning toast alerts the user.
3. **Termination Threshold (15 minutes)**: If inactivity persists for 15 minutes, `useInactivityTimeout` triggers:
   - Disconnects GramJS MTProto client.
   - Clears in-memory session and user identity.
   - Resets all Zustand application store slices.
   - Purges IndexedDB vaults via `forgetDevice()`.
   - Navigates the browser back to `/connect`.
