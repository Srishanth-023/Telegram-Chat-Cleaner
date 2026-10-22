import type { Api } from "telegram";
import type { TelegramClient } from "telegram";
import type { Dialog } from "telegram/tl/custom/dialog";
import { requireClient } from "./client";
import { getSessionState } from "../session/store";

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

  // Retrieve current user ID from in-memory session or query if not yet stored
  let myId: string | undefined = getSessionState().user?.id;
  if (!myId) {
    try {
      const me = await activeClient.getMe();
      if (me && "id" in me) {
        myId = me.id?.toString();
      }
    } catch {
      // If getMe fails, continue without exact myId
    }
  }

  const itemsMap = new Map<string, ChatItem>();
  let totalLoaded = 0;
  let lastReported = 0;
  let lastReportTime = 0;

  const reportProgress = (force = false) => {
    const now = Date.now();
    if (force || totalLoaded - lastReported >= 20 || now - lastReportTime >= 80) {
      lastReported = totalLoaded;
      lastReportTime = now;
      onProgress?.(totalLoaded);
    }
  };

  const fetchFolder = async (folderId: number, isArchived: boolean): Promise<void> => {
    try {
      for await (const dialog of activeClient.iterDialogs({ folder: folderId })) {
        const item = classifyDialog(dialog, myId, isArchived);
        if (item.id && !itemsMap.has(item.id)) {
          itemsMap.set(item.id, item);
          totalLoaded++;
          reportProgress();
        }
      }
    } catch (err) {
      if (folderId === 0 && itemsMap.size === 0) {
        throw err;
      }
    }
  };

  // Fetch Main (0) and Archived (1) concurrently over multiplexed WebSocket connection
  const [folder0Result] = await Promise.allSettled([
    fetchFolder(0, false),
    fetchFolder(1, true),
  ]);

  if (folder0Result.status === "rejected" && itemsMap.size === 0) {
    throw folder0Result.reason;
  }

  reportProgress(true);
  return Array.from(itemsMap.values());
}
