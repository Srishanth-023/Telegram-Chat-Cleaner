import { describe, it, expect, vi, beforeEach } from "vitest";
import { performLogout, isLoggingOut } from "./logout";
import { authBridge } from "../telegram/auth";
import { removalQueue } from "../telegram/queue";
import { useAppStore } from "../store";
import * as clientMod from "../telegram/client";
import * as persistMod from "./persist";
import * as storeMod from "./store";

describe("performLogout", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("resets store, queue, and authBridge", async () => {
    vi.spyOn(clientMod, "getClient").mockReturnValue(null);
    vi.spyOn(clientMod, "disconnectClient").mockResolvedValue(undefined);
    vi.spyOn(persistMod, "forgetDevice").mockResolvedValue(undefined);
    const clearSessionSpy = vi.spyOn(storeMod, "clearInMemorySession");
    const authBridgeResetSpy = vi.spyOn(authBridge, "reset");
    const queueResetSpy = vi.spyOn(removalQueue, "reset");
    const storeResetSpy = vi.spyOn(useAppStore.getState(), "resetAll");

    expect(isLoggingOut()).toBe(false);

    await performLogout({ revokeTelegramSession: false });

    expect(isLoggingOut()).toBe(false);
    expect(authBridgeResetSpy).toHaveBeenCalled();
    expect(queueResetSpy).toHaveBeenCalled();
    expect(storeResetSpy).toHaveBeenCalled();
    expect(clearSessionSpy).toHaveBeenCalled();
    expect(persistMod.forgetDevice).toHaveBeenCalled();
    expect(clientMod.disconnectClient).toHaveBeenCalled();
  });

  it("handles revokeTelegramSession when client is connected", async () => {
    const mockInvoke = vi.fn().mockResolvedValue(true);
    const mockClient = {
      connected: true,
      invoke: mockInvoke,
    } as any;

    vi.spyOn(clientMod, "getClient").mockReturnValue(mockClient);
    vi.spyOn(clientMod, "disconnectClient").mockResolvedValue(undefined);
    vi.spyOn(persistMod, "forgetDevice").mockResolvedValue(undefined);

    await performLogout({ revokeTelegramSession: true });

    expect(clientMod.disconnectClient).toHaveBeenCalled();
  });
});
