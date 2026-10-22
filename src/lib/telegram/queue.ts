import type { ChatItem } from "./dialogs";
import { removeChatItem } from "./removal";
import { mapTelegramError } from "./errors";

export type ItemExecutionStatus = "pending" | "processing" | "success" | "failed" | "skipped";

export interface ItemResult {
  id: string;
  name: string;
  kind: string;
  status: "success" | "failed" | "skipped";
  reason?: string;
  timestamp: number;
}

export type QueueState = "idle" | "running" | "paused" | "completed" | "cancelled";

export interface QueueProgress {
  state: QueueState;
  total: number;
  completed: number;
  successful: number;
  failed: number;
  skipped: number;
  currentItem?: ChatItem;
  remainingSecondsWait?: number;
  results: ItemResult[];
}

export type QueueListener = (progress: QueueProgress) => void;

export class RemovalQueue {
  private state: QueueState = "idle";
  private items: ChatItem[] = [];
  private results: Map<string, ItemResult> = new Map();
  private currentIndex = 0;
  private delayMs = 400;
  private abortController: AbortController | null = null;
  private pausePromise: { promise: Promise<void>; resolve: () => void } | null = null;
  private listeners = new Set<QueueListener>();
  private waitIntervalTimer: NodeJS.Timeout | null = null;
  private currentWaitSeconds = 0;
  private isProcessing = false;

  constructor(delayMs = 400) {
    this.delayMs = delayMs;
  }

  public subscribe(listener: QueueListener): () => void {
    this.listeners.add(listener);
    listener(this.getProgress());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const progress = this.getProgress();
    for (const listener of this.listeners) {
      listener(progress);
    }
  }

  public getProgress(): QueueProgress {
    let successful = 0;
    let failed = 0;
    let skipped = 0;

    for (const res of this.results.values()) {
      if (res.status === "success") successful++;
      else if (res.status === "failed") failed++;
      else if (res.status === "skipped") skipped++;
    }

    const currentItem =
      this.state === "running" && this.currentIndex < this.items.length
        ? this.items[this.currentIndex]
        : undefined;

    return {
      state: this.state,
      total: this.items.length,
      completed: successful + failed + skipped,
      successful,
      failed,
      skipped,
      currentItem,
      remainingSecondsWait: this.currentWaitSeconds > 0 ? this.currentWaitSeconds : undefined,
      results: Array.from(this.results.values()),
    };
  }

  public async start(items: ChatItem[]): Promise<void> {
    if (this.isProcessing) {
      throw new Error("Queue is already executing. Cannot run two removals in parallel.");
    }

    this.items = [...items];
    this.results.clear();
    this.currentIndex = 0;
    this.state = "running";
    this.abortController = new AbortController();
    this.isProcessing = true;
    this.notify();

    await this.processLoop();
  }

  private async processLoop(): Promise<void> {
    const maxRetriesPerItem = 3;

    try {
      while (this.currentIndex < this.items.length) {
        if (this.abortController?.signal.aborted) {
          this.state = "cancelled";
          break;
        }

        // Handle paused state
        if (this.pausePromise) {
          this.state = "paused";
          this.notify();
          await this.pausePromise.promise;
          if (this.abortController?.signal.aborted) {
            this.state = "cancelled";
            break;
          }
          this.state = "running";
          this.notify();
        }

        const item = this.items[this.currentIndex];
        this.notify();

        if (item.isProtected) {
          this.results.set(item.id, {
            id: item.id,
            name: item.name,
            kind: item.kind,
            status: "skipped",
            reason: "Protected conversation (cannot be deleted)",
            timestamp: Date.now(),
          });
          this.currentIndex++;
          this.notify();
          continue;
        }

        let attempts = 0;
        let itemSucceeded = false;

        while (attempts < maxRetriesPerItem && !itemSucceeded) {
          if (this.abortController?.signal.aborted) break;

          attempts++;
          try {
            await removeChatItem(item);
            itemSucceeded = true;
            this.results.set(item.id, {
              id: item.id,
              name: item.name,
              kind: item.kind,
              status: "success",
              timestamp: Date.now(),
            });
          } catch (err: unknown) {
            const friendly = mapTelegramError(err);

            if (friendly.code === "FLOOD_WAIT" && friendly.seconds) {
              // Wait with live countdown
              await this.waitWithCountdown(friendly.seconds);
              // Retry current item
              continue;
            }

            if (friendly.code === "NETWORK_ERROR") {
              // Connection lost, auto pause
              this.pause();
              this.notify();
              return;
            }

            if (attempts >= maxRetriesPerItem) {
              this.results.set(item.id, {
                id: item.id,
                name: item.name,
                kind: item.kind,
                status: "failed",
                reason: friendly.message,
                timestamp: Date.now(),
              });
            } else {
              // Short backoff before retrying
              await new Promise((res) => setTimeout(res, 500));
            }
          }
        }

        this.currentIndex++;
        this.notify();

        // Delay between sequential operations
        if (this.currentIndex < this.items.length && !this.abortController?.signal.aborted) {
          await new Promise((res) => setTimeout(res, this.delayMs));
        }
      }

      if (this.state !== "cancelled" && this.state !== "paused") {
        this.state = "completed";
      }
    } finally {
      this.isProcessing = false;
      this.notify();
    }
  }

  private async waitWithCountdown(seconds: number): Promise<void> {
    this.currentWaitSeconds = seconds;
    this.notify();

    return new Promise<void>((resolve) => {
      this.waitIntervalTimer = setInterval(() => {
        this.currentWaitSeconds--;
        this.notify();

        if (this.currentWaitSeconds <= 0 || this.abortController?.signal.aborted) {
          if (this.waitIntervalTimer) clearInterval(this.waitIntervalTimer);
          this.waitIntervalTimer = null;
          this.currentWaitSeconds = 0;
          this.notify();
          resolve();
        }
      }, 1000);
    });
  }

  public pause(): void {
    if (this.state === "running" && !this.pausePromise) {
      let resolveFn!: () => void;
      const promise = new Promise<void>((res) => {
        resolveFn = res;
      });
      this.pausePromise = { promise, resolve: resolveFn };
      this.state = "paused";
      this.notify();
    }
  }

  public resume(): void {
    if (this.pausePromise) {
      this.pausePromise.resolve();
      this.pausePromise = null;
      this.state = "running";
      this.notify();
    }
  }

  public cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    if (this.waitIntervalTimer) {
      clearInterval(this.waitIntervalTimer);
      this.waitIntervalTimer = null;
      this.currentWaitSeconds = 0;
    }
    if (this.pausePromise) {
      this.pausePromise.resolve();
      this.pausePromise = null;
    }
    this.state = "cancelled";
    this.notify();
  }

  public reset(): void {
    if (this.isProcessing) {
      this.cancel();
    }
    this.items = [];
    this.results.clear();
    this.currentIndex = 0;
    this.state = "idle";
    this.isProcessing = false;
    this.currentWaitSeconds = 0;
    this.abortController = null;
    this.pausePromise = null;
    if (this.waitIntervalTimer) {
      clearInterval(this.waitIntervalTimer);
      this.waitIntervalTimer = null;
    }
    this.notify();
  }

  public async retryFailed(): Promise<void> {
    const failedItems = this.items.filter((item) => {
      const res = this.results.get(item.id);
      return res?.status === "failed";
    });

    if (failedItems.length > 0) {
      await this.start(failedItems);
    }
  }
}

export const removalQueue = new RemovalQueue();
