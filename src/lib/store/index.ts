import { create } from "zustand";
import type { ChatItem, ChatKind } from "../telegram/dialogs";
import type { FriendlyError } from "../telegram/errors";
import type { QueueProgress, QueueState } from "../telegram/queue";

export type TypeFilter = "all" | ChatKind;
export type ArchivedFilter = "all" | "active" | "archived";
export type SortField = "lastActivity" | "name" | "kind";

export interface AppStoreState {
  // Chats & Loading
  chats: ChatItem[];
  isLoadingChats: boolean;
  loadProgress: number; // count loaded
  chatsError: FriendlyError | null;

  // Filter & Search
  searchQuery: string;
  typeFilter: TypeFilter;
  archivedFilter: ArchivedFilter;
  sortField: SortField;
  sortAscending: boolean;

  // Selection
  selectedIds: Set<string>;
  lastSelectedId: string | null;

  // Run / Progress
  queueProgress: QueueProgress | null;

  // Actions
  setChats: (chats: ChatItem[]) => void;
  setIsLoadingChats: (isLoading: boolean) => void;
  setLoadProgress: (count: number) => void;
  setChatsError: (error: FriendlyError | null) => void;

  setSearchQuery: (query: string) => void;
  setTypeFilter: (filter: TypeFilter) => void;
  setArchivedFilter: (filter: ArchivedFilter) => void;
  setSortField: (field: SortField) => void;
  toggleSortDirection: () => void;

  toggleSelect: (id: string) => void;
  selectRange: (targetId: string, currentFilteredIds: string[]) => void;
  selectAllFiltered: (filteredIds: string[]) => void;
  clearSelection: () => void;
  deselectItem: (id: string) => void;

  setQueueProgress: (progress: QueueProgress | null) => void;
  resetAll: () => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  chats: [],
  isLoadingChats: false,
  loadProgress: 0,
  chatsError: null,

  searchQuery: "",
  typeFilter: "all",
  archivedFilter: "all",
  sortField: "lastActivity",
  sortAscending: false,

  selectedIds: new Set<string>(),
  lastSelectedId: null,

  queueProgress: null,

  setChats: (chats) => set({ chats, isLoadingChats: false }),
  setIsLoadingChats: (isLoadingChats) => set({ isLoadingChats }),
  setLoadProgress: (loadProgress) => set({ loadProgress }),
  setChatsError: (chatsError) => set({ chatsError, isLoadingChats: false }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setArchivedFilter: (archivedFilter) => set({ archivedFilter }),
  setSortField: (sortField) => set({ sortField }),
  toggleSortDirection: () => set((state) => ({ sortAscending: !state.sortAscending })),

  toggleSelect: (id) =>
    set((state) => {
      const chat = state.chats.find((c) => c.id === id);
      if (chat?.isProtected) return state; // Protected chats cannot be selected

      const next = new Set(state.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedIds: next, lastSelectedId: id };
    }),

  selectRange: (targetId, currentFilteredIds) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      const protectedSet = new Set<string>();
      for (let i = 0; i < state.chats.length; i++) {
        if (state.chats[i].isProtected) {
          protectedSet.add(state.chats[i].id);
        }
      }

      if (!state.lastSelectedId || !currentFilteredIds.includes(state.lastSelectedId)) {
        if (!protectedSet.has(targetId)) next.add(targetId);
        return { selectedIds: next, lastSelectedId: targetId };
      }

      const startIndex = currentFilteredIds.indexOf(state.lastSelectedId);
      const endIndex = currentFilteredIds.indexOf(targetId);
      const [from, to] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

      for (let i = from; i <= to; i++) {
        const id = currentFilteredIds[i];
        if (!protectedSet.has(id)) {
          next.add(id);
        }
      }

      return { selectedIds: next, lastSelectedId: targetId };
    }),

  selectAllFiltered: (filteredIds) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      const protectedSet = new Set<string>();
      for (let i = 0; i < state.chats.length; i++) {
        if (state.chats[i].isProtected) {
          protectedSet.add(state.chats[i].id);
        }
      }
      for (let i = 0; i < filteredIds.length; i++) {
        const id = filteredIds[i];
        if (!protectedSet.has(id)) {
          next.add(id);
        }
      }
      return { selectedIds: next };
    }),

  clearSelection: () => set({ selectedIds: new Set<string>(), lastSelectedId: null }),

  deselectItem: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      next.delete(id);
      return { selectedIds: next };
    }),

  setQueueProgress: (queueProgress) => set({ queueProgress }),

  resetAll: () =>
    set({
      chats: [],
      isLoadingChats: false,
      loadProgress: 0,
      chatsError: null,
      selectedIds: new Set<string>(),
      lastSelectedId: null,
      queueProgress: null,
    }),
}));
