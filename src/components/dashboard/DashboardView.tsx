"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Search,
  ArrowUpDown,
  RefreshCw,
  CheckSquare,
  Square,
  AlertCircle,
  Inbox,
  Filter,
  X,
} from "@/components/ui/Icons";
import { useAppStore, TypeFilter, ArchivedFilter, SortField } from "@/lib/store";
import { fetchAllDialogs } from "@/lib/telegram/dialogs";
import { getClient } from "@/lib/telegram/client";
import { mapTelegramError } from "@/lib/telegram/errors";
import { isAuthenticated } from "@/lib/security/guards";
import { ChatRow } from "./ChatRow";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
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
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Debounce search query at 200ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 200);

    return () => clearTimeout(handler);
  }, [searchInput, setSearchQuery]);

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
    router?.prefetch?.("/review");
    router?.prefetch?.("/connect");

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

  // Virtualizer setup with 64px row estimate
  const rowVirtualizer = useVirtualizer({
    count: sortedChats.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
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

  const activeFilterCount =
    (typeFilter !== "all" ? 1 : 0) +
    (archivedFilter !== "all" ? 1 : 0) +
    (sortField !== "lastActivity" || !sortAscending ? 1 : 0);

  return (
    <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 sm:pb-32">
      {/* Top Controls Header */}
      <div className="flex flex-col gap-3 mb-3 text-left">
        <div className="flex items-center justify-between gap-2">
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
              className="text-xs min-h-[44px] sm:min-h-0"
              aria-label="Reload chats"
            >
              <RefreshCw className={clsx("w-3.5 h-3.5 sm:mr-1.5", isLoadingChats && "animate-spin")} />
              <span className="hidden sm:inline">Reload Chats</span>
            </Button>

            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden text-xs min-h-[44px] relative"
              aria-label="Open filter options"
            >
              <Filter className="w-3.5 h-3.5 mr-1" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tnum">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Sticky Search & Inline Desktop Filters */}
        <div className="sticky top-14 sm:top-16 z-20 bg-bg pt-1 pb-2">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search conversations by name or @username..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full h-11 sm:h-10 pl-9 pr-9 bg-surface border border-border rounded-control text-base sm:text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text min-h-[40px] min-w-[40px] flex items-center justify-center rounded-control"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Desktop Archived Filter Toggle */}
            <div className="hidden md:inline-flex rounded-control border border-border bg-surface p-1 text-xs select-none shrink-0">
              {(["all", "active", "archived"] as ArchivedFilter[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setArchivedFilter(mode)}
                  className={clsx(
                    "px-3 py-1.5 rounded-[6px] font-medium capitalize transition-colors min-h-[32px]",
                    archivedFilter === mode
                      ? "bg-primary text-white"
                      : "text-text-muted hover:text-text"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Desktop Sort Selector */}
            <div className="hidden md:flex items-center gap-1.5 bg-surface border border-border rounded-control px-2.5 h-10 text-xs shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="bg-transparent text-text font-medium focus:outline-none cursor-pointer"
                aria-label="Sort by field"
              >
                <option value="lastActivity">Recent Activity</option>
                <option value="name">Name</option>
                <option value="kind">Type</option>
              </select>
              <button
                onClick={toggleSortDirection}
                className="p-1.5 text-text-muted hover:text-text rounded-control min-h-[32px] min-w-[32px] flex items-center justify-center"
                title={sortAscending ? "Ascending" : "Descending"}
                aria-label={sortAscending ? "Sort ascending" : "Sort descending"}
              >
                {sortAscending ? "▲" : "▼"}
              </button>
            </div>
          </div>

          {/* Desktop Type Filter Chips */}
          <div className="hidden md:flex items-center gap-1.5 mt-2.5 text-xs select-none">
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
                  "px-3 py-1 rounded-full border transition-all text-xs font-medium",
                  typeFilter === type.id
                    ? "bg-primary-soft border-primary text-primary font-semibold"
                    : "border-border bg-surface text-text-muted hover:border-slate-300 hover:text-text"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Summary & Bulk Selection Row */}
        <div className="flex items-center justify-between py-2 border-y border-border text-xs text-text-muted">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleSelectAllToggle}
              className="flex items-center gap-2 text-text font-medium hover:text-primary transition-colors focus:outline-none min-h-[44px] py-1"
            >
              {isAllFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-text-muted shrink-0" />
              )}
              <span>
                Select All Filtered ({filteredSelectableIds.length})
              </span>
            </button>

            {selectedCount > 0 && (
              <button
                onClick={clearSelection}
                className="text-text-muted hover:text-danger underline ml-2 min-h-[44px] flex items-center"
              >
                Clear
              </button>
            )}
          </div>

          <div className="tnum font-medium text-right">
            {sortedChats.length} of {chats.length}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 rounded-card border border-border bg-surface overflow-hidden relative flex flex-col min-h-0">
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
                  setSearchInput("");
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

        {/* Virtualized Chat List with Overscroll Contain */}
        {!isLoadingChats && !chatsError && sortedChats.length > 0 && (
          <div
            ref={parentRef}
            role="listbox"
            aria-multiselectable="true"
            aria-label="Telegram Conversations"
            className="overflow-y-auto overscroll-contain h-[calc(100dvh-270px)] min-h-[400px] w-full"
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

      {/* Sticky Bottom Action Bar with Safe Area Inset */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border py-3 px-3 sm:px-6 lg:px-8 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="tnum font-bold text-sm sm:text-base text-text">
              {selectedCount} selected
            </span>
            {selectedCount > 0 && (
              <button
                onClick={clearSelection}
                className="text-xs text-text-muted hover:text-danger underline min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Clear all selections"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="md"
              variant="primary"
              disabled={selectedCount === 0}
              onClick={() => router.push("/review")}
              className="font-semibold px-5 sm:px-6 min-h-[44px]"
            >
              Review ({selectedCount})
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet Dialog */}
      <Dialog open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter & Sort</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-2">
            {/* Chat Types */}
            <div>
              <span className="text-xs font-semibold text-text uppercase tracking-wider block mb-2">
                Chat Type
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "all", label: "All Types" },
                  { id: "private", label: "Direct Messages" },
                  { id: "bot", label: "Bots" },
                  { id: "group", label: "Groups" },
                  { id: "channel", label: "Channels" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setTypeFilter(type.id as TypeFilter)}
                    className={clsx(
                      "min-h-[44px] px-3 py-2 rounded-control border text-sm font-medium transition-colors text-left flex items-center justify-between",
                      typeFilter === type.id
                        ? "bg-primary-soft border-primary text-primary font-semibold"
                        : "border-border bg-surface text-text hover:border-slate-300"
                    )}
                  >
                    <span>{type.label}</span>
                    {typeFilter === type.id && <span className="text-primary font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Folder / Archived */}
            <div>
              <span className="text-xs font-semibold text-text uppercase tracking-wider block mb-2">
                Folder
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(["all", "active", "archived"] as ArchivedFilter[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setArchivedFilter(mode)}
                    className={clsx(
                      "min-h-[44px] px-2 py-2 rounded-control border text-sm font-medium capitalize transition-colors flex items-center justify-center",
                      archivedFilter === mode
                        ? "bg-primary text-white border-primary"
                        : "border-border bg-surface text-text"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Field & Order */}
            <div>
              <span className="text-xs font-semibold text-text uppercase tracking-wider block mb-2">
                Sort By
              </span>
              <div className="flex flex-col gap-2">
                {[
                  { id: "lastActivity", label: "Recent Activity" },
                  { id: "name", label: "Alphabetical (Name)" },
                  { id: "kind", label: "Chat Type" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortField(s.id as SortField)}
                    className={clsx(
                      "min-h-[44px] px-3 py-2 rounded-control border text-sm font-medium transition-colors text-left flex items-center justify-between",
                      sortField === s.id
                        ? "bg-primary-soft border-primary text-primary font-semibold"
                        : "border-border bg-surface text-text"
                    )}
                  >
                    <span>{s.label}</span>
                    {sortField === s.id && <span className="text-primary font-bold">✓</span>}
                  </button>
                ))}

                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => {
                      if (!sortAscending) toggleSortDirection();
                    }}
                    className={clsx(
                      "flex-1 min-h-[44px] px-3 py-2 rounded-control border text-xs font-medium text-center",
                      sortAscending
                        ? "bg-primary-soft border-primary text-primary font-semibold"
                        : "border-border text-text-muted"
                    )}
                  >
                    Ascending ▲
                  </button>
                  <button
                    onClick={() => {
                      if (sortAscending) toggleSortDirection();
                    }}
                    className={clsx(
                      "flex-1 min-h-[44px] px-3 py-2 rounded-control border text-xs font-medium text-center",
                      !sortAscending
                        ? "bg-primary-soft border-primary text-primary font-semibold"
                        : "border-border text-text-muted"
                    )}
                  >
                    Descending ▼
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTypeFilter("all");
                setArchivedFilter("all");
                setSortField("lastActivity");
              }}
              className="min-h-[44px] text-xs"
            >
              Reset Filters
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setMobileFilterOpen(false)}
              className="min-h-[44px] px-6 text-sm"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
