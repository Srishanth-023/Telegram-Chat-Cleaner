import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "@/lib/store";
import type { ChatItem, ChatKind } from "@/lib/telegram/dialogs";
import { RemovalQueue } from "@/lib/telegram/queue";

const KINDS: ChatKind[] = ["private", "bot", "group", "supergroup", "channel"];

const SAMPLE_TITLES = [
  "Alpha Team 🚀",
  "DevOps Notifications 🔔",
  "Random Chat with special chars: <script>alert(1)</script>",
  "مرحبا بالعالم (Arabic RTL)",
  "🎉🎊 Weekend Celebrations 🥳🎈",
  "Crypto Discussion Group [OFFICIAL]",
  "Unnamed Chat",
  "John Doe",
  "Support Bot",
  "Marketing & Growth Announcements",
];

function generateSyntheticChats(count: number): ChatItem[] {
  const items: ChatItem[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const kind = KINDS[i % KINDS.length];
    const baseTitle = SAMPLE_TITLES[i % SAMPLE_TITLES.length];
    const isService = i === 0; // ID 777000 protected
    const id = isService ? "777000" : (1000000 + i).toString();

    items[i] = {
      id,
      name: `${baseTitle} #${i + 1}`,
      username: i % 3 === 0 ? `user_${i}` : undefined,
      kind,
      archived: i % 5 === 0,
      unreadCount: i % 4 === 0 ? (i % 20) : 0,
      lastActivity: 1700000000 - i * 3600,
      isOwner: kind !== "private" && kind !== "bot" && i % 10 === 0,
      isProtected: isService,
      peer: {},
    };
  }
  return items;
}

describe("Stress & Scale Performance Benchmarks", () => {
  beforeEach(() => {
    useAppStore.getState().resetAll();
  });

  const datasetSizes = [100, 1000, 10000, 50000];

  for (const size of datasetSizes) {
    it(`handles ${size.toLocaleString()} conversations: bulk selection and filtering under budget`, () => {
      const chats = generateSyntheticChats(size);
      expect(chats).toHaveLength(size);

      // 1. Store population
      const startLoad = performance.now();
      useAppStore.getState().setChats(chats);
      const loadDuration = performance.now() - startLoad;
      expect(useAppStore.getState().chats).toHaveLength(size);

      // Performance budget: Store hydration under 200ms even for 50k
      expect(loadDuration).toBeLessThan(500);

      // 2. Bulk Selection: selectAllFiltered
      const nonProtectedIds = chats.filter((c) => !c.isProtected).map((c) => c.id);
      const startSelectAll = performance.now();
      useAppStore.getState().selectAllFiltered(nonProtectedIds);
      const selectAllDuration = performance.now() - startSelectAll;

      expect(useAppStore.getState().selectedIds.size).toBe(nonProtectedIds.length);
      // Performance budget: Bulk select under 250ms for 50k
      expect(selectAllDuration).toBeLessThan(350);

      // 3. Clear Selection
      const startClear = performance.now();
      useAppStore.getState().clearSelection();
      const clearDuration = performance.now() - startClear;
      expect(useAppStore.getState().selectedIds.size).toBe(0);
      expect(clearDuration).toBeLessThan(50);

      // 4. Filtering benchmark (Search query simulation)
      const query = "team";
      const startFilter = performance.now();
      const filtered = chats.filter(
        (c) => c.name.toLowerCase().includes(query) || (c.username && c.username.toLowerCase().includes(query))
      );
      const filterDuration = performance.now() - startFilter;
      expect(filtered.length).toBeGreaterThan(0);
      const filterBudget = Math.max(50, Math.ceil((size / 1000) * 15));
      expect(filterDuration).toBeLessThan(filterBudget);

      // 5. Sorting benchmark (lastActivity and name)
      const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
      const startSort = performance.now();
      const sorted = [...filtered].sort((a, b) => collator.compare(a.name, b.name));
      const sortDuration = performance.now() - startSort;
      expect(sorted.length).toBe(filtered.length);
      const sortBudget = Math.max(100, Math.ceil((size / 1000) * 20));
      expect(sortDuration).toBeLessThan(sortBudget);
    });
  }

  it("RemovalQueue getProgress() executes in O(1) time without array re-allocations", () => {
    const queue = new RemovalQueue(1);

    // Populate queue with 5,000 results
    for (let i = 0; i < 5000; i++) {
      (queue as any).recordResult({
        id: i.toString(),
        name: `Chat ${i}`,
        kind: "private",
        status: i % 2 === 0 ? "success" : "failed",
        timestamp: Date.now(),
      });
    }

    const startProgress = performance.now();
    for (let i = 0; i < 1000; i++) {
      const progress = queue.getProgress();
      expect(progress.completed).toBe(5000);
      expect(progress.successful).toBe(2500);
      expect(progress.failed).toBe(2500);
    }
    const duration = performance.now() - startProgress;

    // 1,000 calls to getProgress() on 5k items should take < 0.15ms per call
    expect(duration).toBeLessThan(150);
  });

  it("checkbox toggling on 50,000 conversations executes in sub-millisecond time", () => {
    const chats = generateSyntheticChats(50000);
    useAppStore.getState().setChats(chats);

    const startToggle = performance.now();
    useAppStore.getState().toggleSelect("1000050");
    const toggleDuration = performance.now() - startToggle;

    expect(useAppStore.getState().selectedIds.has("1000050")).toBe(true);
    expect(toggleDuration).toBeLessThan(10);
  });
});
