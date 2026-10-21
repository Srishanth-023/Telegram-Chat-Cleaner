# AGENTS.md — Development Guidelines for AI Agents

Welcome, AI Agent. This document establishes the mandatory conventions, invariants, architectural rules, and commands for developing within the **Telegram Chat Cleaner** repository.

---

## 1. Prime Invariants (Never Violate)

1. **Zero Backend**: This project is 100% client-side. Never add server API routes (`/api/*`), server actions, databases, backend proxies, analytics SDKs, or error-tracking services. Static hosting only.
2. **Never Revoke For Others (`revoke: false`)**:
   - All removal operations are strictly for the user's account view only.
   - For `Api.messages.DeleteHistory`: ALWAYS `revoke: false`.
   - For `Api.messages.DeleteChatUser`: ALWAYS `revokeHistory: false`.
   - Never set `revoke: true`. Enforced by `src/lib/telegram/removal.test.ts`.
3. **Never Log Secrets**:
   - Never output `api_id`, `api_hash`, phone numbers, verification codes, 2FA passwords, or GramJS session strings to `console.*`, query parameters, URLs, or unencrypted storage.
   - Enforced by `src/test/security-no-console.test.ts`.
4. **Never Invent APIs**:
   - Check installed typings in `node_modules/telegram/` before using any GramJS call.
   - Trust the installed typings over assumptions and record deviations in `docs/DECISIONS.md`.
5. **TypeScript Strict Mode**:
   - No `any` without a written explanation in a comment.
   - Treat Telegram IDs as `string` or `bigint`, never as JavaScript `number` (to prevent 64-bit integer truncation).

---

## 2. Technology Stack & Directory Conventions

- **Next.js 14.2 App Router**: Static export configuration (`output: 'export'`).
- **Dynamic Client Imports**: All components importing GramJS or MTProto code must use dynamic imports with `{ ssr: false }`.
- **Styling**: Tailwind CSS with custom CSS variable design tokens (`--bg`, `--surface`, `--primary`, `--danger`, etc.). Light theme only.
- **UI Primitives**: Radix UI primitives (`@radix-ui/react-*`), Lucide icons (`lucide-react`).
- **State Management**: Zustand in-memory stores (`src/lib/store/`, `src/lib/session/store.ts`).
- **List Performance**: `@tanstack/react-virtual` for virtualized rendering of 2,000+ chats.

---

## 3. Standard Commands & Quality Gates

Run all quality checks after modifying any code:

```bash
# 1. Typecheck TypeScript strict
npm run typecheck

# 2. Lint check (must have 0 errors and 0 warnings)
npm run lint

# 3. Vitest unit and component tests
npm test

# 4. Playwright E2E tests
npm run test:e2e

# 5. Production static build export
npm run build
```

---

## 4. Documentation Maintenance

Always update documentation when architectural or security decisions evolve:
- `docs/DECISIONS.md`: Record bundler polyfills, typings differences, and assumptions.
- `docs/ARCHITECTURE.md`: Keep Mermaid flowcharts synchronized with code changes.
- `docs/SECURITY.md`: Update threat model when adding storage or connection capabilities.
- `docs/TESTING.md`: Keep test plans and manual test checklists current.
