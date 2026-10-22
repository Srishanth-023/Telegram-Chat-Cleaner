import type { Api } from "telegram";
import type { TelegramClient } from "telegram";
import type { Dialog } from "telegram/tl/custom/dialog";
import { requireClient } from "./client";

export type ChatKind = "private" | "bot" | "group" | "supergroup" | "channel";

export interface ChatItem {
  id: string; // stable string id (bigint-safe)
  name: string;
  username?: string;
  kind: ChatKind;
  archived: boolean;
  unreadCount: number;
  lastActivity?: number; // unix seconds
  isOwner: boolean; // creator of a group/channel
  isProtected: boolean; // cannot be selected
  peer: unknown; // GramJS entity/inputEntity, kept out of UI types
}

export function classifyDialog(dialog: Dialog, myId?: string, isFolderArchived: boolean = false): ChatItem {
  const rawId = dialog.id?.toString() || "";
  const entity = dialog.entity as (Api.User | Api.Chat | Api.Channel | undefined);

  let kind: ChatKind = "private";
  let username: string | undefined;
  let isOwner = false;
  let isProtected = false;

  if (entity) {
    if ("username" in entity && entity.username) {
      username = entity.username;
    }

    if (entity.className === "User" || dialog.isUser) {
      const user = entity as Api.User;
      if (user.bot) {
        kind = "bot";
      } else {
        kind = "private";
      }

      // Check for Telegram Service Notification account (ID 777000)
      if (rawId === "777000" || user.id?.toString() === "777000") {
        isProtected = true;
      }

      // Check for Saved Messages (Self chat)
      if (user.self || (myId && user.id?.toString() === myId)) {
        isProtected = true;
      }
    } else if (entity.className === "Chat" || dialog.isGroup) {
      const chat = entity as Api.Chat;
      kind = "group";
      isOwner = !!chat.creator;
    } else if (entity.className === "Channel" || dialog.isChannel) {
      const channel = entity as Api.Channel;
      if (channel.megagroup || channel.gigagroup) {
        kind = "supergroup";
      } else {
        kind = "channel";
      }
      isOwner = !!channel.creator;
    }
  }

  // Fallback checks for service accounts or saved messages by name/id
  if (rawId === "777000" || (myId && rawId === myId)) {
    isProtected = true;
  }

  const displayName =
    dialog.name ||
    dialog.title ||
    (entity && "title" in entity ? entity.title : "") ||
    (entity && "firstName" in entity ? `${entity.firstName || ""} ${entity.lastName || ""}`.trim() : "") ||
    "Unnamed Chat";

  return {
    id: rawId,
    name: displayName || "Unnamed Chat",
    username,
    kind,
    archived: isFolderArchived || !!dialog.archived || dialog.folderId === 1,
    unreadCount: dialog.unreadCount || 0,
    lastActivity: dialog.date,
    isOwner,
    isProtected,
    peer: dialog.inputEntity || dialog.entity,
  };
}

export async function fetchAllDialogs(
  client?: TelegramClient,
  onProgress?: (count: number) => void
): Promise<ChatItem[]> {
  const activeClient = client || requireClient();

  // Retrieve current user ID to accurately mark Saved Messages
  let myId: string | undefined;
  try {
    const me = await activeClient.getMe();
    if (me && "id" in me) {
      myId = me.id?.toString();
    }
  } catch {
    // If getMe fails, continue without exact myId
  }

  const itemsMap = new Map<string, ChatItem>();
  let totalLoaded = 0;

  // 1. Fetch main dialogs (folder 0)
  try {
    for await (const dialog of activeClient.iterDialogs({ folder: 0 })) {
      const item = classifyDialog(dialog, myId, false);
      if (item.id && !itemsMap.has(item.id)) {
        itemsMap.set(item.id, item);
        totalLoaded++;
        onProgress?.(totalLoaded);
      }
    }
  } catch (err) {
    // If folder 0 iteration fails before yielding any dialogs, rethrow so callers detect real error
    if (itemsMap.size === 0) {
      throw err;
    }
  }

  // 2. Fetch archived dialogs (folder 1)
  try {
    for await (const dialog of activeClient.iterDialogs({ folder: 1 })) {
      const item = classifyDialog(dialog, myId, true);
      if (item.id && !itemsMap.has(item.id)) {
        itemsMap.set(item.id, item);
        totalLoaded++;
        onProgress?.(totalLoaded);
      }
    }
  } catch {
    // If folder 1 iteration fails, continue with loaded items from folder 0
  }

  return Array.from(itemsMap.values());
}
