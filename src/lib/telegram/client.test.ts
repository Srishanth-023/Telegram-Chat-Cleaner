import { describe, it, expect } from "vitest";
import { telegramCredentialsSchema } from "./client";

describe("telegramCredentialsSchema", () => {
  it("validates valid api_id and 32-hex api_hash", () => {
    const valid = {
      apiId: "12345678",
      apiHash: "0123456789abcdef0123456789abcdef",
    };
    const result = telegramCredentialsSchema.parse(valid);
    expect(result.apiId).toBe(12345678);
    expect(result.apiHash).toBe("0123456789abcdef0123456789abcdef");
  });

  it("rejects non-numeric api_id", () => {
    const invalid = {
      apiId: "abc1234",
      apiHash: "0123456789abcdef0123456789abcdef",
    };
    expect(() => telegramCredentialsSchema.parse(invalid)).toThrow("API ID must contain only digits");
  });

  it("rejects non-32-hex api_hash", () => {
    const invalid = {
      apiId: "123456",
      apiHash: "short_hash_123",
    };
    expect(() => telegramCredentialsSchema.parse(invalid)).toThrow("32-character hexadecimal");
  });

  it("rejects zero or negative api_id", () => {
    const invalid = {
      apiId: "0",
      apiHash: "0123456789abcdef0123456789abcdef",
    };
    expect(() => telegramCredentialsSchema.parse(invalid)).toThrow("positive integer");
  });
});
