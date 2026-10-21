"use client";

import React, { memo } from "react";
import { Shield, Crown, Archive, Bot, User, Users, Megaphone } from "@/components/ui/Icons";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import type { ChatItem } from "@/lib/telegram/dialogs";
import { clsx } from "clsx";

interface ChatRowProps {
  item: ChatItem;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onRangeSelect: (id: string) => void;
}

function getDeterministicColor(str: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palettes = [
    { bg: "bg-slate-200", text: "text-slate-800" },
    { bg: "bg-blue-100", text: "text-blue-800" },
    { bg: "bg-slate-300", text: "text-slate-900" },
    { bg: "bg-sky-100", text: "text-sky-800" },
  ];
  return palettes[Math.abs(hash) % palettes.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatLastActivity(unixSeconds?: number): string {
  if (!unixSeconds) return "";
  const now = Date.now() / 1000;
  const diff = now - unixSeconds;

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;

  const date = new Date(unixSeconds * 1000);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const ChatRow = memo(function ChatRow({
  item,
  isSelected,
  onToggle,
  onRangeSelect,
}: ChatRowProps) {
  const color = getDeterministicColor(item.name);
  const initials = getInitials(item.name);

  const handleClick = (e: React.MouseEvent) => {
    if (item.isProtected) return;
    if (e.shiftKey) {
      onRangeSelect(item.id);
    } else {
      onToggle(item.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (item.isProtected) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onToggle(item.id);
    }
  };

  const typeIcon = {
    private: <User className="w-3 h-3" />,
    bot: <Bot className="w-3 h-3" />,
    group: <Users className="w-3 h-3" />,
    supergroup: <Users className="w-3 h-3" />,
    channel: <Megaphone className="w-3 h-3" />,
  }[item.kind];

  return (
    <div
      role="option"
      aria-selected={isSelected}
      tabIndex={item.isProtected ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={clsx(
        "group flex items-center gap-3.5 px-4 py-3 min-h-[58px] border-b border-border transition-colors select-none text-left cursor-pointer",
        isSelected && "bg-primary-soft/80 border-primary/20",
        !isSelected && !item.isProtected && "hover:bg-surface-muted/70 bg-surface",
        item.isProtected && "bg-slate-50 opacity-60 cursor-not-allowed"
      )}
    >
      {/* Selection Checkbox */}
      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        {item.isProtected ? (
          <Tooltip content="Protected: Saved Messages and service notifications cannot be deleted.">
            <div className="p-1 text-text-muted">
              <Shield className="w-4 h-4 text-slate-400" />
            </div>
          </Tooltip>
        ) : (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggle(item.id)}
            aria-label={`Select ${item.name}`}
          />
        )}
      </div>

      {/* Avatar */}
      <div
        className={clsx(
          "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none",
          color.bg,
          color.text
        )}
      >
        {initials}
      </div>

      {/* Info: Name & Username */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-sm text-text truncate max-w-[240px] sm:max-w-md">
            {item.name}
          </span>

          {item.isProtected && (
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-slate-300 text-slate-500">
              Protected
            </Badge>
          )}

          {item.isOwner && (
            <Tooltip content="You are the creator/owner of this group/channel">
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                <Crown className="w-2.5 h-2.5" />
                Owner
              </span>
            </Tooltip>
          )}

          {item.archived && (
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 flex items-center gap-0.5">
              <Archive className="w-2.5 h-2.5" />
              Archived
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
          {item.username && (
            <span className="font-mono text-slate-500 truncate">@{item.username}</span>
          )}
          <span className="inline-flex items-center gap-1 capitalize">
            {typeIcon}
            <span>{item.kind}</span>
          </span>
        </div>
      </div>

      {/* Right Column: Unread count & Date */}
      <div className="shrink-0 flex flex-col items-end text-xs text-text-muted gap-1">
        <span className="tnum text-[11px] font-medium text-slate-400">
          {formatLastActivity(item.lastActivity)}
        </span>

        {item.unreadCount > 0 && (
          <span className="tnum bg-primary text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-[20px] text-center leading-tight">
            {item.unreadCount > 999 ? "999+" : item.unreadCount}
          </span>
        )}
      </div>
    </div>
  );
});
