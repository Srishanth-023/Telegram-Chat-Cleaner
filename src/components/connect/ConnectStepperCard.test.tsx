import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConnectStepperCard } from "./ConnectStepperCard";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock IndexedDB persistence
vi.mock("@/lib/session/persist", () => ({
  loadEncryptedSession: vi.fn().mockResolvedValue(null),
  saveEncryptedSession: vi.fn().mockResolvedValue(undefined),
  forgetDevice: vi.fn().mockResolvedValue(undefined),
}));

describe("ConnectStepperCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the 4 stepper steps on initial load", () => {
    render(<ConnectStepperCard />);

    expect(screen.getByText("Connect Telegram Account")).toBeDefined();
    expect(screen.getByText("GramJS over WSS")).toBeDefined();

    // Check stepper labels
    expect(screen.getByText("API Keys")).toBeDefined();
    expect(screen.getByText("Phone")).toBeDefined();
    expect(screen.getByText("Code")).toBeDefined();
    expect(screen.getByText("2FA Password")).toBeDefined();
  });

  it("validates invalid API credentials and displays inline errors", async () => {
    const user = userEvent.setup();
    render(<ConnectStepperCard />);

    const idInput = screen.getByLabelText(/app api id/i);
    const hashInput = screen.getByPlaceholderText(/32-character hexadecimal hash/i);

    await user.type(idInput, "invalid");
    await user.type(hashInput, "short");

    const nextBtn = screen.getByRole("button", { name: /next: phone verification/i });
    await user.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText(/api id must be a positive integer/i)).toBeDefined();
      expect(screen.getByText(/api hash must be a 32-character hexadecimal string/i)).toBeDefined();
    });
  });

  it("allows toggling visibility of the App Hash input", async () => {
    const user = userEvent.setup();
    render(<ConnectStepperCard />);

    const hashInput = screen.getByPlaceholderText(/32-character hexadecimal hash/i) as HTMLInputElement;
    expect(hashInput.type).toBe("password");

    const toggleBtn = screen.getByRole("button", { name: /show/i });
    await user.click(toggleBtn);

    expect(hashInput.type).toBe("text");

    const hideBtn = screen.getByRole("button", { name: /hide/i });
    await user.click(hideBtn);

    expect(hashInput.type).toBe("password");
  });
});
