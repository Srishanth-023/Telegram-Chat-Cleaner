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
  Info,
  ChevronDown,
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
  const { chats, selectedIds, deselectItem } = useAppStore();

  const [confirmChecked, setConfirmChecked] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [hasReadDetails, setHasReadDetails] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    private: true,
    bot: true,
    group: true,
    supergroup: true,
    channel: true,
  });

  const toggleSection = (kind: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [kind]: !prev[kind],
    }));
  };

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
    hasReadDetails &&
    confirmChecked &&
    confirmText.trim() === "REMOVE" &&
    selectedChats.length > 0;

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
          <Button href="/dashboard" size="md" className="min-h-[44px]">
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
    <div className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-40 lg:pb-24 text-left">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text mb-1.5 font-medium min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Conversations
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">Review & Confirmation</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Carefully review your selection of {selectedChats.length} conversation(s) before proceeding.
          </p>
        </div>

        <Badge variant="primary" className="text-xs px-3 py-1 font-semibold shrink-0">
          {selectedChats.length} Selected
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Warnings, Consequences, and Collapsible Itemized List */}
        <div className="lg:col-span-7 space-y-4">
          {/* Danger Callouts */}
          {ownedChatsCount > 0 && (
            <div className="p-3.5 rounded-card bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
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
            <div className="p-3.5 rounded-card bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
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

          {/* Consequences Panel with Read Details Requirement */}
          <Card className="bg-surface-muted/60 border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-text">
                  Consequences Summary
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDetailsOpen(!detailsOpen);
                  setHasReadDetails(true);
                }}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 min-h-[44px] px-2"
                aria-expanded={detailsOpen}
              >
                <span>{detailsOpen ? "Hide details" : "Read details"}</span>
                <ChevronDown
                  className={clsx("w-3.5 h-3.5 transition-transform", detailsOpen && "rotate-180")}
                />
              </button>
            </div>

            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Removal operations only delete conversations from your view. Other participants keep their copy.
            </p>

            {detailsOpen && (
              <div className="mt-3 pt-3 border-t border-border space-y-2 text-xs text-text-muted animate-in fade-in duration-150">
                <ul className="space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>
                    <strong>Account-Only Removal:</strong> For Direct Messages, your copy is removed. For Groups/Channels, your account leaves the group.
                  </li>
                  <li>
                    <strong>Irreversible:</strong> History cannot be restored through this app after removal.
                  </li>
                  <li>
                    <strong>Rejoining:</strong> Private groups or channels require an invite link to rejoin.
                  </li>
                </ul>
                <div className="text-[11px] text-emerald-600 font-medium pt-1">
                  ✓ Consequences reviewed. Confirmation controls unlocked.
                </div>
              </div>
            )}
          </Card>

          {/* Collapsible Grouped Selected List */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Selected Conversations ({selectedChats.length})
            </h2>

            {(Object.keys(groupedChats) as ChatKind[]).map((kind) => {
              const items = groupedChats[kind];
              if (items.length === 0) return null;
              const { title, icon } = kindLabels[kind];
              const isExpanded = !!expandedSections[kind];

              return (
                <Card key={kind} className="p-0 overflow-hidden border-border bg-surface">
                  <button
                    type="button"
                    onClick={() => toggleSection(kind)}
                    className="w-full px-4 py-3 bg-surface-muted/70 border-b border-border flex items-center justify-between text-left hover:bg-surface-muted transition-colors min-h-[48px]"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-text uppercase tracking-wider">
                      {icon}
                      <span>{title} ({items.length})</span>
                    </div>
                    <ChevronDown
                      className={clsx("w-4 h-4 text-text-muted transition-transform", isExpanded && "rotate-180")}
                    />
                  </button>

                  {isExpanded && (
                    <div className="divide-y divide-border">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-4 py-3 text-xs hover:bg-surface-muted/40 transition-colors min-h-[52px]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="font-semibold text-text truncate max-w-[200px] sm:max-w-md">
                              {item.name}
                            </span>
                            {item.username && (
                              <span className="font-mono text-slate-400 text-[11px] truncate">
                                @{item.username}
                              </span>
                            )}
                            {item.isOwner && (
                              <Badge variant="warning" className="text-[10px] py-0 px-1.5 shrink-0">
                                Owner
                              </Badge>
                            )}
                            {item.archived && (
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 shrink-0">
                                Archived
                              </Badge>
                            )}
                          </div>

                          <button
                            onClick={() => deselectItem(item.id)}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-control text-text-muted hover:text-danger hover:bg-red-50 transition-colors"
                            title="Remove from selection"
                            aria-label={`Deselect ${item.name}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column / Sticky Bottom on Mobile: Confirmation Panel */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <Card className="border-red-200 bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 text-danger font-bold text-sm mb-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>Security Confirmation</span>
            </div>

            {!hasReadDetails && (
              <div className="mb-3 p-2.5 rounded-control bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                Please tap <strong>&quot;Read details&quot;</strong> in the Consequences Summary above to unlock confirmation.
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Part 1: Checkbox */}
              <div>
                <Checkbox
                  id="confirmation-checkbox"
                  disabled={!hasReadDetails}
                  checked={confirmChecked}
                  onCheckedChange={(checked) => setConfirmChecked(!!checked)}
                  label={`I understand that these ${selectedChats.length} conversation(s) will be permanently removed from my Telegram account only.`}
                />
              </div>

              {/* Part 2: Type REMOVE */}
              <div className="pt-1">
                <label
                  htmlFor="type-remove-input"
                  className={clsx(
                    "block font-semibold uppercase tracking-wider text-[11px] mb-1.5",
                    hasReadDetails ? "text-text" : "text-text-muted"
                  )}
                >
                  To confirm, type <span className="font-mono text-danger font-bold">REMOVE</span>:
                </label>
                <Input
                  id="type-remove-input"
                  type="text"
                  placeholder="Type REMOVE"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={!hasReadDetails}
                  mono
                  className="font-bold text-base sm:text-sm min-h-[44px]"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Clear 16px gap before destructive button to prevent mis-taps */}
            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
              <Button
                variant="danger"
                size="md"
                disabled={!isConfirmationSatisfied}
                onClick={handleStartRemoval}
                className="w-full font-semibold min-h-[48px]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove {selectedChats.length} Conversation{selectedChats.length > 1 ? "s" : ""}
              </Button>

              <Button
                href="/dashboard"
                variant="outline"
                size="md"
                className="w-full min-h-[44px]"
              >
                Cancel & Return
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
