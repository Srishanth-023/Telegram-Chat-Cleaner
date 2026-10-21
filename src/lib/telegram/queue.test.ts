import { describe, it, expect, vi, beforeEach } from "vitest";
import { RemovalQueue } from "./queue";
import type { ChatItem } from "./dialogs";
import * as removalMod from "./removal";

describe("RemovalQueue Engine", () => {
  let queue: RemovalQueue;

  beforeEach(() => {
    vi.restoreAllMocks();
    queue = new RemovalQueue(10); // 10ms delay for fast tests
  });

  it("processes sequential items and marks them as successful", async () => {
    vi.spyOn(removalMod, "removeChatItem").mockResolvedValue(undefined);

    const items: ChatItem[] = [
      { id: "1", name: "Chat 1", kind: "private", archived: false, unreadCount: 0, isOwner: false, isProtected: false, peer: {} },
      { id: "2", name: "Chat 2", kind: "private", archived: false, unreadCount: 0, isOwner: false, isProtected: false, peer: {} },
    ];

    await queue.start(items);
    const progress = queue.getProgress();

    expect(progress.state).toBe("completed");
    expect(progress.completed).toBe(2);
    expect(progress.successful).toBe(2);
    expect(progress.failed).toBe(0);
  });

  it("skips protected chats automatically", async () => {
    const spy = vi.spyOn(removalMod, "removeChatItem").mockResolvedValue(undefined);

    const items: ChatItem[] = [
      { id: "777000", name: "Telegram Service", kind: "private", archived: false, unreadCount: 0, isOwner: false, isProtected: true, peer: {} },
    ];

    await queue.start(items);
    const progress = queue.getProgress();

    expect(progress.skipped).toBe(1);
    expect(spy).not.toHaveBeenCalled();
  });

  it("supports cancellation mid-run", async () => {
    let callCount = 0;
    vi.spyOn(removalMod, "removeChatItem").mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        queue.cancel();
      }
    });

    const items: ChatItem[] = [
      { id: "1", name: "Chat 1", kind: "private", archived: false, unreadCount: 0, isOwner: false, isProtected: false, peer: {} },
      { id: "2", name: "Chat 2", kind: "private", archived: false, unreadCount: 0, isOwner: false, isProtected: false, peer: {} },
      { id: "3", name: "Chat 3", kind: "private", archived: false, unreadCount: 0, isOwner: false, isProtected: false, peer: {} },
    ];

    await queue.start(items);
    const progress = queue.getProgress();

    expect(progress.state).toBe("cancelled");
    expect(progress.completed).toBe(1);
  });

  it("handles pause and resume", async () => {
    vi.spyOn(removalMod, "removeChatItem").mockResolvedValue(undefined);

    const items: ChatItem[] = [
      { id: "1", name: "Chat 1", kind: "private", archived: false, unreadCount: 0, isOwner: false, isProtected: false, peer: {} },
      { id: "2", name: "Chat 2", kind: "private", archived: false, unreadCount: 0, isOwner: false, isProtected: false, peer: {} },
    ];

    queue.pause();
    expect(queue.getProgress().state).toBe("idle"); // Not running yet
  });
});
