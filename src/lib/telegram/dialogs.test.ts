import { describe, it, expect } from "vitest";
import { classifyDialog } from "./dialogs";

describe("Dialog Normalization and Classification", () => {
  it("classifies standard private user", () => {
    const mockDialog: any = {
      id: { toString: () => "12345" },
      name: "John Doe",
      isUser: true,
      entity: { className: "User", id: { toString: () => "12345" }, bot: false },
      unreadCount: 2,
      date: 1700000000,
    };

    const item = classifyDialog(mockDialog, "99999");
    expect(item.id).toBe("12345");
    expect(item.name).toBe("John Doe");
    expect(item.kind).toBe("private");
    expect(item.isProtected).toBe(false);
    expect(item.isOwner).toBe(false);
  });

  it("classifies bot user", () => {
    const mockDialog: any = {
      id: { toString: () => "54321" },
      name: "Test Bot",
      isUser: true,
      entity: { className: "User", id: { toString: () => "54321" }, bot: true, username: "test_bot" },
      unreadCount: 0,
      date: 1700000000,
    };

    const item = classifyDialog(mockDialog);
    expect(item.kind).toBe("bot");
    expect(item.username).toBe("test_bot");
    expect(item.isProtected).toBe(false);
  });

  it("marks Telegram service account (777000) as isProtected", () => {
    const mockDialog: any = {
      id: { toString: () => "777000" },
      name: "Telegram",
      isUser: true,
      entity: { className: "User", id: { toString: () => "777000" } },
    };

    const item = classifyDialog(mockDialog);
    expect(item.isProtected).toBe(true);
  });

  it("marks Saved Messages (self) as isProtected", () => {
    const mockDialog: any = {
      id: { toString: () => "99999" },
      name: "Saved Messages",
      isUser: true,
      entity: { className: "User", id: { toString: () => "99999" }, self: true },
    };

    const item = classifyDialog(mockDialog, "99999");
    expect(item.isProtected).toBe(true);
  });

  it("classifies basic group with ownership", () => {
    const mockDialog: any = {
      id: { toString: () => "88888" },
      name: "Family Group",
      isGroup: true,
      entity: { className: "Chat", id: { toString: () => "88888" }, creator: true },
    };

    const item = classifyDialog(mockDialog);
    expect(item.kind).toBe("group");
    expect(item.isOwner).toBe(true);
    expect(item.isProtected).toBe(false);
  });

  it("classifies supergroup vs broadcast channel", () => {
    const supergroupDialog: any = {
      id: { toString: () => "11111" },
      name: "Tech Supergroup",
      isChannel: true,
      entity: { className: "Channel", id: { toString: () => "11111" }, megagroup: true, creator: false },
    };

    const supergroupItem = classifyDialog(supergroupDialog);
    expect(supergroupItem.kind).toBe("supergroup");
    expect(supergroupItem.isOwner).toBe(false);

    const channelDialog: any = {
      id: { toString: () => "22222" },
      name: "News Broadcast",
      isChannel: true,
      entity: { className: "Channel", id: { toString: () => "22222" }, megagroup: false, creator: true },
    };

    const channelItem = classifyDialog(channelDialog);
    expect(channelItem.kind).toBe("channel");
    expect(channelItem.isOwner).toBe(true);
  });
});
