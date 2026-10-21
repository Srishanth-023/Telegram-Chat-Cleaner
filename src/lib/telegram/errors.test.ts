import { describe, it, expect } from "vitest";
import { mapTelegramError } from "./errors";

describe("mapTelegramError", () => {
  it("maps FLOOD_WAIT error with seconds", () => {
    const err = new Error("RPCError: 420: FLOOD_WAIT_23");
    const result = mapTelegramError(err);
    expect(result.code).toBe("FLOOD_WAIT");
    expect(result.seconds).toBe(23);
    expect(result.message).toContain("23s");
  });

  it("maps PHONE_CODE_INVALID", () => {
    const err = { errorMessage: "PHONE_CODE_INVALID" };
    const result = mapTelegramError(err);
    expect(result.code).toBe("PHONE_CODE_INVALID");
    expect(result.title).toBe("Invalid Verification Code");
  });

  it("maps PASSWORD_HASH_INVALID", () => {
    const err = new Error("PASSWORD_HASH_INVALID");
    const result = mapTelegramError(err);
    expect(result.code).toBe("PASSWORD_HASH_INVALID");
  });

  it("maps AUTH_KEY_UNREGISTERED", () => {
    const err = new Error("AUTH_KEY_UNREGISTERED");
    const result = mapTelegramError(err);
    expect(result.code).toBe("AUTH_KEY_UNREGISTERED");
  });

  it("maps network error", () => {
    const err = new Error("WebSocket connection failed");
    const result = mapTelegramError(err);
    expect(result.code).toBe("NETWORK_ERROR");
  });

  it("maps PHONE_NUMBER_INVALID", () => {
    const err = new Error("400: PHONE_NUMBER_INVALID");
    const result = mapTelegramError(err);
    expect(result.code).toBe("PHONE_NUMBER_INVALID");
    expect(result.title).toBe("Invalid Phone Number");
  });

  it("maps PHONE_NUMBER_FLOOD", () => {
    const err = new Error("420: PHONE_NUMBER_FLOOD");
    const result = mapTelegramError(err);
    expect(result.code).toBe("PHONE_NUMBER_FLOOD");
    expect(result.title).toBe("Phone Limit Exceeded");
  });

  it("handles null or empty error safely", () => {
    const result = mapTelegramError(null);
    expect(result.title).toBe("Unknown Error");
  });
});
