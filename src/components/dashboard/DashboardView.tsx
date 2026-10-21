"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  RefreshCw,
  CheckSquare,
  Square,
  AlertCircle,
  Archive,
  Inbox,
  Filter,
  X,
} from "@/components/ui/Icons";
import { useAppStore, TypeFilter, ArchivedFilter, SortField } from "@/lib/store";
import { fetchAllDialogs, ChatItem } from "@/lib/telegram/dialogs";
import { requireClient, getClient } from "@/lib/telegram/client";
import { mapTelegramError } from "@/lib/telegram/errors";
import { isAuthenticated } from "@/lib/security/guards";
import { ChatRow } from "./ChatRow";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { clsx } from "clsx";

export function DashboardView() {
  const router = useRouter();
  const parentRef = useRef<HTMLDivElement>(null);

  const {
    chats,
    isLoadingChats,
    loadProgress,
    chatsError,
    setChats,
    setIsLoadingChats,
    setLoadProgress,
    setChatsError,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    archivedFilter,
    setArchivedFilter,
    sortField,
    setSortField,
    sortAscending,
    toggleSortDirection,
    selectedIds,
    toggleSelect,
    selectRange,
    selectAllFiltered,
    clearSelection,
  } = useAppStore();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const loadConversations = useCallback(async () => {
    setIsLoadingChats(true);
    setChatsError(null);
    setLoadProgress(0);

    try {
      const client = getClient();
      if (!client) {
        router.push("/connect");
        return;
      }
      const loaded = await fetchAllDialogs(client, (count) => {
        setLoadProgress(count);
      });
      setChats(loaded);
    } catch (err: unknown) {
      const friendly = mapTelegramError(err);
      setChatsError(friendly);
    } finally {
      setIsLoadingChats(false);
    }
  }, [router, setChats, setChatsError, setIsLoadingChats, setLoadProgress]);

  // Initial load & route guard check
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/connect");
      return;
    }

    if (chats.length === 0 && !isLoadingChats) {
      loadConversations();
    }
  }, [chats.length, isLoadingChats, loadConversations, router]);

  // Filter & Sort computations
  const filteredChats = useMemo(() => {
    return chats.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesUsername = item.username?.toLowerCase().includes(query);
        if (!matchesName && !matchesUsername) return false;
      }

      // Type filter
      if (typeFilter !== "all") {
        if (typeFilter === "group") {
          if (item.kind !== "group" && item.kind !== "supergroup") return false;
        } else if (item.kind !== typeFilter) {
          return false;
        }
      }

      // Archived filter
      if (archivedFilter === "active" && item.archived) return false;
      if (archivedFilter === "archived" && !item.archived) return false;

      return true;
    });
  }, [chats, searchQuery, typeFilter, archivedFilter]);

  const sortedChats = useMemo(() => {
    return [...filteredChats].sort((a, b) => {
      let comparison = 0;
      if (sortField === "lastActivity") {
        comparison = (a.lastActivity || 0) - (b.lastActivity || 0);
      } else if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "kind") {
        comparison = a.kind.localeCompare(b.kind);
      }
      return sortAscending ? comparison : -comparison;
    });
  }, [filteredChats, sortField, sortAscending]);

  const filteredSelectableIds = useMemo(() => {
    return sortedChats.filter((c) => !c.isProtected).map((c) => c.id);
  }, [sortedChats]);

  // Virtualizer setup
  const rowVirtualizer = useVirtualizer({
    count: sortedChats.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 58,
    overscan: 10,
  });

  const selectedCount = selectedIds.size;
  const isAllFilteredSelected =
    filteredSelectableIds.length > 0 &&
    filteredSelectableIds.every((id) => selectedIds.has(id));

  const handleSelectAllToggle = () => {
    if (isAllFilteredSelected) {
      clearSelection();
    } else {
      selectAllFiltered(filteredSelectableIds);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-28">
      {/* Top Controls Header */}
      <div className="flex flex-col gap-4 mb-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
              Conversations
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Select conversations you want to remove from your account.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadConversations}
              disabled={isLoadingChats}
              className="text-xs"
            >
              <RefreshCw className={clsx("w-3.5 h-3.5 mr-1.5", isLoadingChats && "animate-spin")} />
              Reload Chats
            </Button>

            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="sm:hidden text-xs"
            >
              <Filter className="w-3.5 h-3.5 mr-1" />
              Filters
            </Button>
          </div>
        </div>

        {/* Toolbar: Search, Filters, Sorting */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search conversations by name or @username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-8 bg-surface border border-border rounded-control text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Archived Filter Toggle */}
          <div className="hidden sm:inline-flex rounded-control border border-border bg-surface p-1 text-xs select-none">
            {(["all", "active", "archived"] as ArchivedFilter[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setArchivedFilter(mode)}
                className={clsx(
                  "px-3 py-1 rounded-[6px] font-medium capitalize transition-colors",
                  archivedFilter === mode
                    ? "bg-primary text-white"
                    : "text-text-muted hover:text-text"
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-surface border border-border rounded-control px-2.5 h-10 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="bg-transparent text-text font-medium focus:outline-none cursor-pointer"
            >
              <option value="lastActivity">Recent Activity</option>
              <option value="name">Name</option>
              <option value="kind">Type</option>
            </select>
            <button
              onClick={toggleSortDirection}
              className="p-1 text-text-muted hover:text-text rounded-control"
              title={sortAscending ? "Ascending" : "Descending"}
            >
              {sortAscending ? "▲" : "▼"}
            </button>
          </div>
        </div>

        {/* Type Filter Chips (Desktop & Mobile) */}
        <div
          className={clsx(
            "flex items-center gap-1.5 flex-wrap text-xs select-none",
            !mobileFilterOpen && "hidden sm:flex"
          )}
        >
          <span className="text-text-muted font-medium mr-1">Types:</span>
          {[
            { id: "all", label: "All" },
            { id: "private", label: "Private" },
            { id: "bot", label: "Bots" },
            { id: "group", label: "Groups" },
            { id: "channel", label: "Channels" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setTypeFilter(type.id as TypeFilter)}
              className={clsx(
                "px-2.5 py-1 rounded-full border transition-all text-xs font-medium",
                typeFilter === type.id
                  ? "bg-primary-soft border-primary text-primary font-semibold"
                  : "border-border bg-surface text-text-muted hover:border-slate-300 hover:text-text"
              )}
            >
              {type.label}
            </button>
          ))}

          {/* Mobile extra archived selector */}
          <div className="sm:hidden flex items-center gap-1 w-full mt-2 pt-2 border-t border-border">
            <span className="text-text-muted font-medium mr-1">Folder:</span>
            {(["all", "active", "archived"] as ArchivedFilter[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setArchivedFilter(mode)}
                className={clsx(
                  "px-2.5 py-0.5 rounded-full border text-xs capitalize",
                  archivedFilter === mode
                    ? "bg-primary text-white border-primary"
                    : "border-border text-text-muted bg-surface"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Summary & Bulk Selection Row */}
        <div className="flex items-center justify-between py-2 border-y border-border text-xs text-text-muted">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAllToggle}
              className="flex items-center gap-1.5 text-text font-medium hover:text-primary transition-colors focus:outline-none"
            >
              {isAllFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-primary" />
              ) : (
                <Square className="w-4 h-4 text-text-muted" />
              )}
              <span>
                Select All Filtered ({filteredSelectableIds.length})
              </span>
            </button>

            {selectedCount > 0 && (
              <button
                onClick={clearSelection}
                className="text-text-muted hover:text-danger underline ml-2"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="tnum font-medium">
            Showing {sortedChats.length} of {chats.length} conversations
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 rounded-card border border-border bg-surface overflow-hidden relative flex flex-col">
        {/* Loading State with Determinate Counter */}
        {isLoadingChats && (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div>
              <h3 className="font-semibold text-text text-base">Loading Telegram Conversations</h3>
              <p className="text-xs text-text-muted mt-1 tnum">
                {loadProgress > 0 ? `Loaded ${loadProgress} chats...` : "Paginating dialogs from Telegram..."}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoadingChats && chatsError && (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
            <AlertCircle className="w-10 h-10 text-danger" />
            <h3 className="font-semibold text-text text-base">{chatsError.title}</h3>
            <p className="text-xs text-text-muted max-w-md">{chatsError.message}</p>
            <Button size="sm" onClick={loadConversations} className="mt-2 text-xs">
              Retry Loading Chats
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingChats && !chatsError && sortedChats.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Inbox className="w-10 h-10 text-slate-300" />
            <h3 className="font-semibold text-text text-base">No Conversations Found</h3>
            <p className="text-xs text-text-muted max-w-sm">
              {chats.length === 0
                ? "Your Telegram account has no active or archived dialogs."
                : "No conversations match your search query and filters."}
            </p>
            {(searchQuery || typeFilter !== "all" || archivedFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                  setArchivedFilter("all");
                }}
                className="text-xs mt-2"
              >
                Reset All Filters
              </Button>
            )}
          </div>
        )}

        {/* Virtualized Chat List */}
        {!isLoadingChats && !chatsError && sortedChats.length > 0 && (
          <div
            ref={parentRef}
            role="listbox"
            aria-multiselectable="true"
            aria-label="Telegram Conversations"
            className="overflow-auto max-h-[600px] w-full"
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const item = sortedChats[virtualRow.index];
                const isSelected = selectedIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <ChatRow
                      item={item}
                      isSelected={isSelected}
                      onToggle={toggleSelect}
                      onRangeSelect={(id) => selectRange(id, filteredSelectableIds)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border py-3.5 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="tnum font-bold text-sm sm:text-base text-text">
              {selectedCount} selected
            </span>
            {selectedCount > 0 && (
              <button
                onClick={clearSelection}
                className="text-xs text-text-muted hover:text-danger underline hidden sm:inline"
              >
                Deselect all
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="md"
              variant="primary"
              disabled={selectedCount === 0}
              onClick={() => router.push("/review")}
              className="font-semibold px-6"
            >
              Review Selection ({selectedCount})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
