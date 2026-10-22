import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatRow } from "./ChatRow";
import type { ChatItem } from "@/lib/telegram/dialogs";

describe("ChatRow Component", () => {
  const normalChat: ChatItem = {
    id: "100",
    name: "General Discussion",
    kind: "supergroup",
    archived: false,
    unreadCount: 4,
    isOwner: false,
    isProtected: false,
    peer: {},
  };

  const protectedChat: ChatItem = {
    id: "777000",
    name: "Telegram Service",
    kind: "private",
    archived: false,
    unreadCount: 0,
    isOwner: false,
    isProtected: true,
    peer: {},
  };

  it("triggers onToggle when non-protected row is clicked", () => {
    const onToggle = vi.fn();
    const onRangeSelect = vi.fn();

    render(
      <ChatRow
        item={normalChat}
        isSelected={false}
        onToggle={onToggle}
        onRangeSelect={onRangeSelect}
      />
    );

    const row = screen.getByRole("option");
    fireEvent.click(row);
    expect(onToggle).toHaveBeenCalledWith("100");
  });

  it("does NOT render checkbox and does NOT call onToggle for protected rows", () => {
    const onToggle = vi.fn();
    const onRangeSelect = vi.fn();

    render(
      <ChatRow
        item={protectedChat}
        isSelected={false}
        onToggle={onToggle}
        onRangeSelect={onRangeSelect}
      />
    );

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getByText("Protected")).toBeInTheDocument();

    const row = screen.getByRole("option");
    fireEvent.click(row);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("extracts emoji initials safely without breaking surrogate pairs", () => {
    const emojiChat: ChatItem = {
      id: "200",
      name: "🚀 Team Alpha 🎉",
      kind: "group",
      archived: false,
      unreadCount: 0,
      isOwner: false,
      isProtected: false,
      peer: {},
    };

    render(
      <ChatRow
        item={emojiChat}
        isSelected={false}
        onToggle={vi.fn()}
        onRangeSelect={vi.fn()}
      />
    );

    // Initial avatar should contain both valid emoji characters without surrogate corruption
    expect(screen.getByText("🚀🎉")).toBeInTheDocument();
  });
});
