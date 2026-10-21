import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReviewView } from "./ReviewView";
import { useAppStore } from "@/lib/store";
import type { ChatItem } from "@/lib/telegram/dialogs";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/security/guards", () => ({
  isAuthenticated: () => true,
}));

describe("ReviewView Confirmation Gating", () => {
  const mockSelectedChats: ChatItem[] = [
    {
      id: "101",
      name: "Old Group",
      kind: "group",
      archived: false,
      unreadCount: 0,
      isOwner: false,
      isProtected: false,
      peer: {},
    },
    {
      id: "102",
      name: "Spam Bot",
      kind: "bot",
      archived: false,
      unreadCount: 0,
      isOwner: false,
      isProtected: false,
      peer: {},
    },
  ];

  beforeEach(() => {
    useAppStore.getState().resetAll();
    useAppStore.getState().setChats(mockSelectedChats);
    useAppStore.getState().selectAllFiltered(["101", "102"]);
  });

  it("destructive removal button stays disabled until checkbox AND REMOVE text are entered", () => {
    render(<ReviewView />);

    const removeBtn = screen.getByRole("button", { name: /Remove 2 Conversations/i });
    expect(removeBtn).toBeDisabled();

    // Check only the checkbox
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(removeBtn).toBeDisabled();

    // Type incorrect text
    const textInput = screen.getByPlaceholderText(/Type REMOVE/i);
    fireEvent.change(textInput, { target: { value: "remove" } }); // lowercase
    expect(removeBtn).toBeDisabled();

    // Type exact REMOVE
    fireEvent.change(textInput, { target: { value: "REMOVE" } });
    expect(removeBtn).not.toBeDisabled();

    // Uncheck checkbox
    fireEvent.click(checkbox);
    expect(removeBtn).toBeDisabled();
  });
});
