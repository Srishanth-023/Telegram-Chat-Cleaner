# Automated & Manual Test Plan

This document details the complete testing strategy for Telegram Chat Cleaner, encompassing automated unit tests, component suites, Playwright E2E tests, and a manual test protocol for throw-away chats.

---

## 1. Automated Test Suites

### Running Automated Tests
```bash
# Unit and component tests (Vitest)
npm test

# E2E integration tests (Playwright)
npm run test:e2e
```

### Coverage Matrix

| Test Suite | File Location | Key Invariants Tested |
| :--- | :--- | :--- |
| **Removal Safety** | `src/lib/telegram/removal.test.ts` | **`revoke: false` hard invariant**: Asserts `revoke: false` for private chats, `revokeHistory: false` for basic groups, and blocks removal of protected chats (*Saved Messages*, *Telegram Service*). |
| **No-Console Security** | `src/test/security-no-console.test.ts` | Statically checks all files in `lib/telegram` and `lib/session` for any `console.*` calls to ensure credentials never leak. |
| **Session Encryption** | `src/lib/session/persist.test.ts` | Validates WebCrypto AES-GCM 256-bit encryption/decryption round-trip and automatic TTL expiration. |
| **Queue & Engine** | `src/lib/telegram/queue.test.ts` | Tests sequential processing, pause/resume, cancel via `AbortController`, and `FloodWaitError` live countdown. |
| **Error Mapping** | `src/lib/telegram/errors.test.ts` | Verifies user-friendly mapping of GramJS RPC errors (`PHONE_CODE_INVALID`, `FLOOD_WAIT_X`, `SESSION_REVOKED`, etc.). |
| **Dialog Classification** | `src/lib/telegram/dialogs.test.ts` | Tests normalization of Users, Bots, Basic Groups, Supergroups, and Channels, and flags ownership and protected entities. |
| **Store & Selection** | `src/lib/store/index.test.ts` | Validates selection toggles, Shift-click range selections, Select All Filtered, and protected item exclusion. |
| **Credentials Stepper** | `src/components/connect/ConnectStepperCard.test.tsx` | Tests 4-step wizard UI, Zod schema validation, and show/hide password toggle. |
| **Destructive Review Gate** | `src/components/review/ReviewView.test.tsx` | Verifies that destructive action button remains strictly disabled until the checkbox is checked AND `REMOVE` is typed. |
| **Chat Row Component** | `src/components/dashboard/ChatRow.test.tsx` | Verifies click handling, protected item styling, type badges, and keyboard navigation. |
| **E2E Onboarding & Connect** | `e2e/onboarding.spec.ts`, `e2e/connect.spec.ts` | Verifies landing page rendering, navigation to connect, form validation, and route guards for unauthenticated visitors. |
| **E2E Flow & Failure Paths** | `e2e/flow.spec.ts` | Full workflow execution from connect through confirmation, plus failure scenarios. |

---

## 2. Manual Testing Protocol (Throw-Away Account Checklist)

Execute this manual protocol before deploying updates, using a designated Telegram test account with throw-away dialogs:

### Step 1: Authentication & Connect Flow
- [ ] Open application in an Incognito / Private browser window.
- [ ] Verify HTTPS warning banner does not appear on `localhost` or HTTPS production URLs.
- [ ] Enter valid `api_id` and `api_hash` from [my.telegram.org](https://my.telegram.org).
- [ ] Toggle Show/Hide on `api_hash` field and confirm masking behaves properly.
- [ ] Enter phone number and confirm verification code is received in Telegram.
- [ ] Enter incorrect verification code and observe user-friendly error notice without console leaks.
- [ ] Enter correct code (and 2FA password if account has Cloud Password enabled).
- [ ] Verify transition to `/dashboard` upon successful login.

### Step 2: Dashboard & Conversation Exploration
- [ ] Verify determinate loading counter displays progress while loading dialogs.
- [ ] Verify both active (folder 0) and archived (folder 1) chats are loaded.
- [ ] Confirm *Saved Messages* and *Telegram Service Notifications (777000)* display a lock icon / protected badge and cannot be selected.
- [ ] Test real-time search by typing contact name and `@username`.
- [ ] Toggle type filter chips (*All*, *Private*, *Bots*, *Groups*, *Channels*) and folder controls (*Active*, *Archived*).
- [ ] Perform Shift-click range selection across rows and verify only valid (non-protected) chats are selected.
- [ ] Click "Select all filtered" and verify selection counter matches expectations.
- [ ] Click "Clear selection" and verify counter resets to 0.

### Step 3: Review & Confirmation Gating
- [ ] Select 3 throw-away test chats (e.g., 1 test bot, 1 test private chat, 1 test group).
- [ ] Click "Review selection" to navigate to `/review`.
- [ ] Confirm chats are grouped by kind.
- [ ] If an owned group is selected, verify the warning callout is prominent.
- [ ] Verify the red "Remove N conversations" button is disabled.
- [ ] Check the "I understand" checkbox and verify button remains disabled.
- [ ] Type lowercase `remove` and verify button remains disabled.
- [ ] Type uppercase `REMOVE` and verify button is now enabled.

### Step 4: Removal Execution & Flood Handling
- [ ] Click "Remove N conversations" to start the run.
- [ ] Verify browser prompts a warning if attempting to close/reload the tab (`beforeunload`).
- [ ] Confirm the progress bar advances smoothly with ~400ms delay between items.
- [ ] Test the **Pause** button: verify current operation finishes and queue pauses.
- [ ] Test the **Resume** button: verify processing continues smoothly.
- [ ] Verify live audit log lists each processed item with status badges.
- [ ] In the native Telegram client (Desktop/Mobile), confirm that deleted chats disappeared from your own account view only.
- [ ] For the test group/bot, confirm that messages remain intact for other participants (`revoke: false`).

### Step 5: Completion & Session Teardown
- [ ] Confirm completion summary card displays total processed, failed, and skipped counts.
- [ ] Click "Download CSV Summary" and verify download contains chat IDs and names.
- [ ] In the top navbar, click user profile badge and choose "Log Out Session on Telegram".
- [ ] Verify session is terminated on Telegram servers and local memory data is wiped.
- [ ] Confirm browser redirects to `/connect`.
