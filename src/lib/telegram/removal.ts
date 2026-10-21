import { Api } from "telegram";
import type { TelegramClient } from "telegram";
import bigInt from "big-integer";
import type { ChatItem } from "./dialogs";
import { requireClient } from "./client";

export interface RemovalRequestBuilder {
  buildPrivateDeleteRequest(peer: unknown): Api.messages.DeleteHistory;
  buildBasicGroupDeleteRequest(chatId: string): Api.messages.DeleteChatUser;
  buildChannelLeaveRequest(channel: unknown): Api.channels.LeaveChannel;
}

export const removalRequestBuilder: RemovalRequestBuilder = {
  buildPrivateDeleteRequest(peer: unknown): Api.messages.DeleteHistory {
    return new Api.messages.DeleteHistory({
      peer: peer as Api.TypeEntityLike,
      maxId: 0,
      revoke: false, // CRITICAL: Never delete for the other party
    });
  },
  buildBasicGroupDeleteRequest(chatId: string): Api.messages.DeleteChatUser {
    // Basic group IDs in Telegram are positive numbers or bigints
    const cleanId = chatId.startsWith("-") ? chatId.replace(/^-/, "") : chatId;
    return new Api.messages.DeleteChatUser({
      chatId: bigInt(cleanId) as unknown as bigInt.BigInteger,
      userId: "me",
      revokeHistory: false, // CRITICAL: Never delete for the group
    });
  },
  buildChannelLeaveRequest(channel: unknown): Api.channels.LeaveChannel {
    return new Api.channels.LeaveChannel({
      channel: channel as Api.TypeEntityLike,
    });
  },
};

export async function removeChatItem(
  item: ChatItem,
  customClient?: TelegramClient
): Promise<void> {
  if (item.isProtected) {
    throw new Error(`Cannot remove protected chat: ${item.name}`);
  }

  const client = customClient || requireClient();

  if (item.kind === "private" || item.kind === "bot") {
    let offset = 0;
    // Loop until history is fully drained
    do {
      const request = removalRequestBuilder.buildPrivateDeleteRequest(item.peer);
      // Safety assertion before invoke
      if (request.revoke !== false) {
        throw new Error("Security violation: revoke must be false");
      }

      const res = await client.invoke(request);
      if (res && "offset" in res && typeof res.offset === "number") {
        offset = res.offset;
      } else {
        offset = 0;
      }
    } while (offset > 0);
  } else if (item.kind === "group") {
    // 1. Leave the basic group (revokeHistory: false)
    const leaveRequest = removalRequestBuilder.buildBasicGroupDeleteRequest(item.id);
    if (leaveRequest.revokeHistory !== false) {
      throw new Error("Security violation: revokeHistory must be false");
    }
    await client.invoke(leaveRequest);

    // 2. Clear leftover dialog history from user's account
    try {
      const cleanupRequest = removalRequestBuilder.buildPrivateDeleteRequest(item.peer);
      if (cleanupRequest.revoke !== false) {
        throw new Error("Security violation: revoke must be false");
      }
      await client.invoke(cleanupRequest);
    } catch {
      // Ignore cleanup error if already removed
    }
  } else if (item.kind === "supergroup" || item.kind === "channel") {
    // Leave supergroup or broadcast channel
    const leaveChannelReq = removalRequestBuilder.buildChannelLeaveRequest(item.peer);
    await client.invoke(leaveChannelReq);
  }
}
