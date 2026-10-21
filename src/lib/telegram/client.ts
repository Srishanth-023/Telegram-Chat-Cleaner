import type { TelegramClient } from "telegram";
import { z } from "zod";

export const telegramCredentialsSchema = z.object({
  apiId: z
    .string()
    .trim()
    .regex(/^\d+$/, "API ID must contain only digits")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "API ID must be a positive integer"),
  apiHash: z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{32}$/, "API Hash must be a 32-character hexadecimal string"),
});

export type TelegramCredentials = {
  apiId: string;
  apiHash: string;
};

let clientSingleton: TelegramClient | null = null;
let currentApiCredentials: { apiId: number; apiHash: string } | null = null;

export function getClient(): TelegramClient | null {
  return clientSingleton;
}

export function requireClient(): TelegramClient {
  if (!clientSingleton) {
    throw new Error("Telegram client is not initialized or disconnected.");
  }
  return clientSingleton;
}

export function getStoredApiCredentials(): { apiId: number; apiHash: string } | null {
  return currentApiCredentials;
}

export async function createTelegramClient(
  credentials: TelegramCredentials,
  sessionString: string = ""
): Promise<TelegramClient> {
  const parsed = telegramCredentialsSchema.parse(credentials);

  // If there's an existing client, disconnect cleanly first
  if (clientSingleton) {
    try {
      await clientSingleton.disconnect();
    } catch {
      // Ignore disconnect errors on old client
    }
    clientSingleton = null;
  }

  // Dynamically load GramJS only when establishing connection
  const [{ TelegramClient }, { StringSession }, { Logger, LogLevel }] = await Promise.all([
    import("telegram"),
    import("telegram/sessions"),
    import("telegram/extensions/Logger"),
  ]);

  const silentLogger = new Logger(LogLevel.NONE);
  silentLogger.log = () => {};

  const session = new StringSession(sessionString);
  const client = new TelegramClient(session, parsed.apiId, parsed.apiHash, {
    connectionRetries: 5,
    useWSS: true,
    floodSleepThreshold: 0, // Allow queue.ts to catch and display countdown
    baseLogger: silentLogger,
    deviceModel: "Telegram Chat Cleaner",
    appVersion: "1.0.0",
    systemVersion: "Web",
  });

  clientSingleton = client;
  currentApiCredentials = { apiId: parsed.apiId, apiHash: parsed.apiHash };

  return client;
}

export async function disconnectClient(): Promise<void> {
  if (clientSingleton) {
    try {
      await clientSingleton.disconnect();
    } catch {
      // Disconnect cleanup error
    } finally {
      clientSingleton = null;
      currentApiCredentials = null;
    }
  }
}
