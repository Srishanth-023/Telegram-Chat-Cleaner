import { getClient, disconnectClient } from "../telegram/client";
import { forgetDevice } from "./persist";
import { clearInMemorySession } from "./store";
import { authBridge } from "../telegram/auth";
import { removalQueue } from "../telegram/queue";
import { useAppStore } from "../store";

export interface LogoutOptions {
  revokeTelegramSession?: boolean;
}

let isLoggingOutInProgress = false;

export function isLoggingOut(): boolean {
  return isLoggingOutInProgress;
}

export async function performLogout(
  options: LogoutOptions = { revokeTelegramSession: true }
): Promise<void> {
  if (isLoggingOutInProgress) return;
  isLoggingOutInProgress = true;

  try {
    // 1. Immediately reset all app store data (chats, selections, errors)
    // to stop active rendering and listeners on existing session
    useAppStore.getState().resetAll();

    // 2. Reset removal queue
    removalQueue.reset();

    // 3. Reset authBridge to clean "credentials" step (prevents phantom auto-finalization on /connect)
    authBridge.reset();

    // 4. Invalidate session on Telegram servers if requested
    if (options.revokeTelegramSession) {
      try {
        const client = getClient();
        if (client && client.connected) {
          try {
            const { Api } = await import("telegram");
            await client.invoke(new Api.auth.LogOut());
          } catch {
            // Ignore RPC logout error if session already revoked or network dropped
          }
        }
      } catch {
        // Ignore client error
      }
    }

    // 5. Disconnect socket cleanly
    try {
      await disconnectClient();
    } catch {
      // Ignore disconnect error
    }

    // 6. Wipe IndexedDB vault
    try {
      await forgetDevice();
    } catch {
      // Ignore storage error
    }

    // 7. Reset in-memory session (user, tokens)
    clearInMemorySession();
  } finally {
    isLoggingOutInProgress = false;
  }
}
