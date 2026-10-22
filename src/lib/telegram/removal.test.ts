import { describe, it, expect, vi } from "vitest";
import { removalRequestBuilder, removeChatItem } from "./removal";
import type { ChatItem } from "./dialogs";

describe("Removal Safety & Revoke Invariant", () => {
  it("buildPrivateDeleteRequest ALWAYS sets revoke: false and targets all messages", () => {
    const req = removalRequestBuilder.buildPrivateDeleteRequest({ id: "123" });
    expect(req.revoke).toBe(false);
    expect(req.maxId).toBe(2147483647);
  });

  it("buildBasicGroupDeleteRequest ALWAYS sets revokeHistory: false", () => {
    const req = removalRequestBuilder.buildBasicGroupDeleteRequest("12345");
    expect(req.revokeHistory).toBe(false);
    expect(req.userId).toBe("me");
  });

  it("prevents deletion of protected chats", async () => {
    const protectedItem: ChatItem = {
      id: "777000",
      name: "Telegram Service",
      kind: "private",
      archived: false,
      unreadCount: 0,
      isOwner: false,
      isProtected: true,
      peer: {},
    };

    await expect(removeChatItem(protectedItem)).rejects.toThrow("Cannot remove protected chat");
  });

  it("invokes DeleteHistory with revoke: false for private chat", async () => {
    const mockClient = {
      invoke: vi.fn().mockResolvedValue({ offset: 0 }),
    };

    const privateItem: ChatItem = {
      id: "998877",
      name: "John Doe",
      kind: "private",
      archived: false,
      unreadCount: 0,
      isOwner: false,
      isProtected: false,
      peer: { id: "998877" },
    };

    await removeChatItem(privateItem, mockClient as any);
    expect(mockClient.invoke).toHaveBeenCalledTimes(1);
    const invokedArg = mockClient.invoke.mock.calls[0][0];
    expect(invokedArg.className).toBe("messages.DeleteHistory");
    expect(invokedArg.revoke).toBe(false);
  });
});
