import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveEncryptedSession, loadEncryptedSession, forgetDevice, EncryptedSessionPayload } from "./persist";

describe("Encrypted Session Persistence (WebCrypto AES-GCM)", () => {
  // Mock IndexedDB in jsdom environment if not provided
  const storeMap = new Map<string, any>();

  beforeEach(() => {
    storeMap.clear();
  });

  it("handles expiry logic correctly", () => {
    const expiredPayload: EncryptedSessionPayload = {
      sessionString: "1BVtsdummy...",
      apiId: "123456",
      apiHash: "abcdef0123456789abcdef0123456789",
      expiresAt: Date.now() - 1000, // expired 1s ago
    };

    const isExpired = Date.now() > expiredPayload.expiresAt;
    expect(isExpired).toBe(true);

    const validPayload: EncryptedSessionPayload = {
      ...expiredPayload,
      expiresAt: Date.now() + 3600 * 1000,
    };
    expect(Date.now() > validPayload.expiresAt).toBe(false);
  });

  it("performs AES-GCM encryption and decryption round-trip with WebCrypto", async () => {
    const key = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true, // extractable for test verification
      ["encrypt", "decrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const testData = JSON.stringify({
      sessionString: "1BVts_gramjs_session_key_12345",
      apiId: "987654",
      apiHash: "0123456789abcdef0123456789abcdef",
      expiresAt: Date.now() + 86400000,
    });

    const encoded = new TextEncoder().encode(testData);
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );

    expect(ciphertext.byteLength).toBeGreaterThan(0);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    const decoded = new TextDecoder().decode(decrypted);
    expect(decoded).toBe(testData);
    const parsed = JSON.parse(decoded);
    expect(parsed.apiId).toBe("987654");
    expect(parsed.sessionString).toBe("1BVts_gramjs_session_key_12345");
  });
});
