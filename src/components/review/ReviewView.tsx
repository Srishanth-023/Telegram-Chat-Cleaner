"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ShieldAlert,
  ArrowLeft,
  Trash2,
  X,
  Crown,
  User,
  Bot,
  Users,
  Megaphone,
  CheckCircle2,
  Info,
} from "@/components/ui/Icons";
import { useAppStore } from "@/lib/store";
import { isAuthenticated } from "@/lib/security/guards";
import type { ChatItem, ChatKind } from "@/lib/telegram/dialogs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { clsx } from "clsx";

export function ReviewView() {
  const router = useRouter();
  const { chats, selectedIds, deselectItem, clearSelection } = useAppStore();

  const [confirmChecked, setConfirmChecked] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    router?.prefetch?.("/progress");
    router?.prefetch?.("/dashboard");
    router?.prefetch?.("/connect");

    if (!isAuthenticated()) {
      router.push("/connect");
    }
  }, [router]);

  // Re-read active selection from the store
  const selectedChats = useMemo(() => {
    return chats.filter((c) => selectedIds.has(c.id) && !c.isProtected);
  }, [chats, selectedIds]);

  const ownedChatsCount = useMemo(() => {
    return selectedChats.filter((c) => c.isOwner).length;
  }, [selectedChats]);

  const isLargeBatch = selectedChats.length > 50;

  // Group by kind
  const groupedChats = useMemo(() => {
    const groups: Record<ChatKind, ChatItem[]> = {
      private: [],
      bot: [],
      group: [],
      supergroup: [],
      channel: [],
    };
    for (const chat of selectedChats) {
      groups[chat.kind].push(chat);
    }
    return groups;
  }, [selectedChats]);

  const isConfirmationSatisfied =
    confirmChecked && confirmText.trim() === "REMOVE" && selectedChats.length > 0;

  const handleStartRemoval = () => {
    if (!isConfirmationSatisfied) return;
    router.push("/progress");
  };

  if (selectedChats.length === 0) {
    return (
      <div className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
        <Card className="p-8">
          <Info className="w-10 h-10 text-primary mx-auto mb-3" />
          <h2 className="text-lg font-bold text-text mb-1">No Conversations Selected</h2>
          <p className="text-xs text-text-muted mb-6">
            Please select at least one conversation from your dashboard to review and remove.
          </p>
          <Button href="/dashboard" size="md">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const kindLabels: Record<ChatKind, { title: string; icon: React.ReactNode }> = {
    private: { title: "Private Chats", icon: <User className="w-4 h-4" /> },
    bot: { title: "Bots", icon: <Bot className="w-4 h-4" /> },
    group: { title: "Basic Groups", icon: <Users className="w-4 h-4" /> },
    supergroup: { title: "Supergroups", icon: <Users className="w-4 h-4" /> },
    channel: { title: "Channels", icon: <Megaphone className="w-4 h-4" /> },
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 pb-24 text-left">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Conversations
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-text">Review & Confirmation</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Carefully review your selection of {selectedChats.length} conversation(s) before proceeding.
          </p>
        </div>

        <Badge variant="primary" className="text-xs px-3 py-1 font-semibold">
          {selectedChats.length} Selected
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Warnings, Consequences, and Itemized List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Danger Callouts */}
          <div className="space-y-3">
        {ownedChatsCount > 0 && (
          <div className="p-4 rounded-card bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <Crown className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-semibold block mb-0.5">
                Owner Warning: {ownedChatsCount} Group(s) / Channel(s) Created by You
              </strong>
              <p className="leading-relaxed">
                You are listed as the creator/owner of {ownedChatsCount} selected group(s) or channel(s). Leaving will remove them from your personal chat list, but <strong>will NOT delete the group or channel for other members</strong>. The chat will stay active without you.
              </p>
            </div>
          </div>
        )}

        {isLargeBatch && (
          <div className="p-4 rounded-card bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-semibold block mb-0.5">
                Large Batch Warning ({selectedChats.length} chats)
              </strong>
              <p className="leading-relaxed">
                Removing more than 50 chats may trigger temporary Telegram flood-wait limits. The execution engine will automatically pause and show a countdown if Telegram requests a cooldown.
              </p>
            </div>
          </div>
        )}

        {/* Consequences Panel */}
        <Card className="bg-surface-muted/60 border-border p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-primary" />
            Plain-Language Consequences
          </h3>
          <ul className="text-xs text-text-muted space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>
              <strong>Account-Only Removal:</strong> Conversations are removed from <em>your</em> Telegram account only. The other person or members retain their copy.
            </li>
            <li>
              <strong>No Undo:</strong> Once removed, conversation history cannot be retrieved through this tool.
            </li>
            <li>
              <strong>Rejoining Groups:</strong> If you leave a private group or channel, you will need a valid invite link to rejoin.
            </li>
          </ul>
        </Card>
      </div>

      {/* Grouped Selected List */}
      <div className="space-y-6 mb-8">
        {(Object.keys(groupedChats) as ChatKind[]).map((kind) => {
          const items = groupedChats[kind];
          if (items.length === 0) return null;
          const { title, icon } = kindLabels[kind];

          return (
            <Card key={kind} className="p-0 overflow-hidden border-border bg-surface">
              <div className="px-4 py-3 bg-surface-muted/70 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-xs text-text uppercase tracking-wider">
                  {icon}
                  <span>{title} ({items.length})</span>
                </div>
              </div>

              <div className="divide-y divide-border">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3 text-xs hover:bg-surface-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-semibold text-text truncate max-w-[220px] sm:max-w-md">
                        {item.name}
                      </span>
                      {item.username && (
                        <span className="font-mono text-slate-400 text-[11px] truncate">
                          @{item.username}
                        </span>
                      )}
                      {item.isOwner && (
                        <Badge variant="warning" className="text-[10px] py-0 px-1.5">
                          Owner
                        </Badge>
                      )}
                      {item.archived && (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                          Archived
                        </Badge>
                      )}
                    </div>

                    <button
                      onClick={() => deselectItem(item.id)}
                      className="p-1 rounded-control text-text-muted hover:text-danger hover:bg-red-50 transition-colors"
                      title="Remove from selection"
                      aria-label={`Deselect ${item.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

        </div>

        {/* Right Column: Sticky Confirmation Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <Card className="border-red-200 bg-surface p-6">
            <div className="flex items-center gap-2 text-danger font-bold text-sm mb-4">
              <ShieldAlert className="w-5 h-5" />
              <span>Final Security Confirmation Required</span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Part 1: Checkbox */}
              <Checkbox
                id="confirmation-checkbox"
                checked={confirmChecked}
                onCheckedChange={(checked) => setConfirmChecked(!!checked)}
                label={`I understand that these ${selectedChats.length} conversation(s) will be permanently removed from my Telegram account only, and cannot be undone.`}
              />

              {/* Part 2: Type REMOVE */}
              <div className="pt-2">
                <label
                  htmlFor="type-remove-input"
                  className="block font-semibold text-text uppercase tracking-wider text-[11px] mb-1.5"
                >
                  To confirm, type <span className="font-mono text-danger font-bold">REMOVE</span> in the box below:
                </label>
                <Input
                  id="type-remove-input"
                  type="text"
                  placeholder="Type REMOVE"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  mono
                  className="max-w-xs font-bold"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                href="/dashboard"
                variant="outline"
                size="md"
                className="w-full sm:w-auto"
              >
                Cancel & Return to Dashboard
              </Button>

              <Button
                variant="danger"
                size="md"
                disabled={!isConfirmationSatisfied}
                onClick={handleStartRemoval}
                className="w-full sm:w-auto font-semibold px-6"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove {selectedChats.length} Conversation{selectedChats.length > 1 ? "s" : ""}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
