import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "./index";
import type { ChatItem } from "../telegram/dialogs";

const mockChats: ChatItem[] = [
  {
    id: "1",
    name: "Alice",
    kind: "private",
    archived: false,
    unreadCount: 0,
    isOwner: false,
    isProtected: false,
    peer: {},
  },
  {
    id: "2",
    name: "Bob",
    kind: "private",
    archived: false,
    unreadCount: 0,
    isOwner: false,
    isProtected: false,
    peer: {},
  },
  {
    id: "3",
    name: "Saved Messages",
    kind: "private",
    archived: false,
    unreadCount: 0,
    isOwner: false,
    isProtected: true, // PROTECTED!
    peer: {},
  },
  {
    id: "4",
    name: "News Channel",
    kind: "channel",
    archived: true,
    unreadCount: 5,
    isOwner: true,
    isProtected: false,
    peer: {},
  },
];

describe("App Store Selection & Filter Logic", () => {
  beforeEach(() => {
    useAppStore.getState().resetAll();
    useAppStore.getState().setChats(mockChats);
  });

  it("toggles chat selection", () => {
    useAppStore.getState().toggleSelect("1");
    expect(useAppStore.getState().selectedIds.has("1")).toBe(true);

    useAppStore.getState().toggleSelect("1");
    expect(useAppStore.getState().selectedIds.has("1")).toBe(false);
  });

  it("never selects protected chats", () => {
    useAppStore.getState().toggleSelect("3");
    expect(useAppStore.getState().selectedIds.has("3")).toBe(false);
  });

  it("selects all filtered chats excluding protected ones", () => {
    const filteredIds = ["1", "2", "3", "4"];
    useAppStore.getState().selectAllFiltered(filteredIds);
    const selected = useAppStore.getState().selectedIds;

    expect(selected.has("1")).toBe(true);
    expect(selected.has("2")).toBe(true);
    expect(selected.has("3")).toBe(false); // Protected!
    expect(selected.has("4")).toBe(true);
    expect(selected.size).toBe(3);
  });

  it("handles shift range selection properly", () => {
    useAppStore.getState().toggleSelect("1"); // lastSelected is 1
    const filteredIds = ["1", "2", "3", "4"];
    useAppStore.getState().selectRange("4", filteredIds);

    const selected = useAppStore.getState().selectedIds;
    expect(selected.has("1")).toBe(true);
    expect(selected.has("2")).toBe(true);
    expect(selected.has("3")).toBe(false); // Protected skipped
    expect(selected.has("4")).toBe(true);
  });
});
