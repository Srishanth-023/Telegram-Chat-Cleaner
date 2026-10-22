"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  LogOut,
  RefreshCw,
  Shield,
  FileSpreadsheet,
  Clock,
  StopCircle,
  Info,
} from "@/components/ui/Icons";
import { useAppStore } from "@/lib/store";
import { removalQueue, QueueProgress } from "@/lib/telegram/queue";
import { disconnectClient } from "@/lib/telegram/client";
import { forgetDevice } from "@/lib/session/persist";
import { clearInMemorySession } from "@/lib/session/store";
import { isAuthenticated } from "@/lib/security/guards";
import { getClient } from "@/lib/telegram/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { clsx } from "clsx";

export function ProgressView() {
  const router = useRouter();
  const { chats, setChats, selectedIds, clearSelection } = useAppStore();

  const [progress, setProgress] = useState<QueueProgress>(removalQueue.getProgress());
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // Re-read selected items from store
  const selectedChats = useMemo(() => {
    return chats.filter((c) => selectedIds.has(c.id) && !c.isProtected);
  }, [chats, selectedIds]);

  // Screen Wake Lock helper
  const acquireWakeLock = async () => {
    try {
      if (typeof navigator !== "undefined" && "wakeLock" in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
      }
    } catch {
      // Wake lock request failed or unsupported; gracefully proceed
    }
  };

  const releaseWakeLock = async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch {
      // Ignore
    }
  };

  // Manage wake lock based on progress state
  useEffect(() => {
    if (progress.state === "running") {
      acquireWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {
      releaseWakeLock();
    };
  }, [progress.state]);

  // Visibility & Network handling (Auto-pause on background tab or offline)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        if (removalQueue.getProgress().state === "running") {
          removalQueue.pause();
        }
        await releaseWakeLock();
      } else {
        // Returned to tab: re-acquire wake lock if running
        if (removalQueue.getProgress().state === "running") {
          await acquireWakeLock();
        }
      }
    };

    const handleOffline = () => {
      if (removalQueue.getProgress().state === "running") {
        removalQueue.pause();
      }
    };

    const handleOnline = async () => {
      const client = getClient();
      if (client && !client.connected) {
        try {
          await client.connect();
        } catch {
          // Will be handled upon user clicking resume
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // BeforeUnload safety protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (progress.state === "running" || progress.state === "paused") {
        e.preventDefault();
        e.returnValue = "Removal is currently in progress. Leaving will cancel remaining chats.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [progress.state]);

  // Subscribe to queue
  useEffect(() => {
    router?.prefetch?.("/dashboard");
    router?.prefetch?.("/connect");

    if (!isAuthenticated()) {
      router.push("/connect");
      return;
    }

    const unsubscribe = removalQueue.subscribe((newProgress) => {
      setProgress(newProgress);
    });

    // Start queue if idle and there are items
    if (removalQueue.getProgress().state === "idle" && selectedChats.length > 0) {
      removalQueue.start(selectedChats).catch(() => {});
    }

    return () => {
      unsubscribe();
    };
  }, [router, selectedChats]);

  const total = progress.total || selectedChats.length;
  const percent = total > 0 ? Math.round((progress.completed / total) * 100) : 0;
  const isFinished = progress.state === "completed" || progress.state === "cancelled";

  // Estimated time left (assuming ~400ms delay + 200ms per request)
  const remainingCount = Math.max(0, total - progress.completed);
  const estimatedSeconds = Math.max(0, Math.ceil(remainingCount * 0.6));

  const handlePauseResume = async () => {
    if (progress.state === "running") {
      removalQueue.pause();
    } else if (progress.state === "paused") {
      const client = getClient();
      if (client && !client.connected) {
        try {
          await client.connect();
        } catch {
          // Reconnect attempt
        }
      }
      removalQueue.resume();
    }
  };

  const handleCancel = () => {
    removalQueue.cancel();
  };

  const handleRetryFailed = async () => {
    await removalQueue.retryFailed();
  };

  const handleBackToDashboard = () => {
    const successfulIds = new Set<string>();
    progress.results.forEach((res) => {
      if (res.status === "success") {
        successfulIds.add(res.id);
      }
    });
    if (successfulIds.size > 0) {
      setChats(chats.filter((c) => !successfulIds.has(c.id)));
    }
    clearSelection();
    router.push("/dashboard");
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const client = getClient();
      if (client && client.connected) {
        try {
          const { Api } = await import("telegram");
          await client.invoke(new Api.auth.LogOut());
        } catch {
          // Ignore
        }
      }
      await disconnectClient();
      await forgetDevice();
      clearInMemorySession();
      router.push("/connect");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDownloadSummary = (format: "csv" | "json") => {
    const results = progress.results;
    let dataStr = "";
    let mimeType = "";
    let fileName = `telegram-cleaner-summary-${new Date().toISOString().slice(0, 10)}`;

    if (format === "json") {
      dataStr = JSON.stringify(results, null, 2);
      mimeType = "application/json";
      fileName += ".json";
    } else {
      const headers = ["ID", "Name", "Kind", "Status", "Reason", "Timestamp"];
      const rows = results.map((r) => [
        `"${r.id}"`,
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.kind}"`,
        `"${r.status}"`,
        `"${(r.reason || "").replace(/"/g, '""')}"`,
        `"${new Date(r.timestamp).toISOString()}"`,
      ]);
      dataStr = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      mimeType = "text/csv";
      fileName += ".csv";
    }

    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 pb-36 sm:pb-24 text-left">
      {/* Top Banner for Screen Wake & Keep Tab Open */}
      {!isFinished && (
        <div className="mb-4 p-3 rounded-card bg-primary-soft border border-primary/20 text-text text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <span>Keep this tab open and your screen on until removal completes.</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
            {isFinished ? "Removal Summary" : "Removing Conversations"}
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            {isFinished
              ? "All operations completed. Review summary and audit logs below."
              : "Sequential execution in progress with rate-limit protection."}
          </p>
        </div>

        <Badge
          variant={
            progress.state === "completed"
              ? "success"
              : progress.state === "paused"
              ? "warning"
              : progress.state === "cancelled"
              ? "danger"
              : "primary"
          }
          className="text-xs px-3 py-1 font-semibold uppercase tracking-wider self-start sm:self-auto"
        >
          {progress.state}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Column: Progress Controls & Status Summary */}
        <div className="md:col-span-5 space-y-4">
          {/* Flood-Wait Live Alert */}
          {progress.remainingSecondsWait && progress.remainingSecondsWait > 0 && (
            <div
              role="alert"
              className="p-3.5 rounded-card bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                <div>
                  <strong className="text-xs sm:text-sm font-semibold block">
                    Rate Limit (Flood Wait)
                  </strong>
                  <p className="text-[11px] text-amber-800">
                    Waiting {progress.remainingSecondsWait}s before continuing automatically.
                  </p>
                </div>
              </div>
              <span className="tnum text-lg font-bold font-mono text-warning bg-amber-100 px-2.5 py-1 rounded-control border border-amber-200">
                {progress.remainingSecondsWait}s
              </span>
            </div>
          )}

          {/* Paused Auto-Resume Banner */}
          {progress.state === "paused" && (
            <div className="p-3.5 rounded-card bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-3">
              <div>
                <strong className="font-semibold block">Execution Paused</strong>
                <span className="text-[11px] text-amber-800">
                  Tab was backgrounded or connection dropped. Tap resume to continue.
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePauseResume}
                className="min-h-[44px] shrink-0 px-4"
              >
                Resume
              </Button>
            </div>
          )}

          {/* Active Run Card */}
          <Card className="bg-surface border-border p-4 sm:p-5">
            {/* Progress Bar & Current Operation */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-text">Overall Progress</span>
                <span className="tnum text-primary font-bold">{percent}%</span>
              </div>
              <Progress value={percent} className="h-3" />
            </div>

            {/* Current Chat Indicator */}
            {!isFinished && progress.currentItem && (
              <div className="p-2.5 rounded-control bg-surface-muted border border-border flex items-center justify-between gap-2 text-xs mb-3">
                <div className="flex items-center gap-2 truncate">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="text-text-muted hidden sm:inline">Processing:</span>
                  <strong className="text-text font-semibold truncate max-w-[140px] sm:max-w-xs">
                    {progress.currentItem.name}
                  </strong>
                </div>

                <span className="tnum text-text-muted shrink-0 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ~{estimatedSeconds}s
                </span>
              </div>
            )}

            {/* 3-Column Stats Row: Done, Failed, Remaining */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border">
              <div className="p-2 rounded-control bg-surface-muted/50">
                <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider block">
                  Done
                </span>
                <span className="tnum text-base sm:text-lg font-bold text-success">
                  {progress.successful}
                </span>
              </div>

              <div className="p-2 rounded-control bg-surface-muted/50">
                <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider block">
                  Failed
                </span>
                <span className="tnum text-base sm:text-lg font-bold text-danger">
                  {progress.failed}
                </span>
              </div>

              <div className="p-2 rounded-control bg-surface-muted/50">
                <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider block">
                  Remaining
                </span>
                <span className="tnum text-base sm:text-lg font-bold text-text">
                  {remainingCount}
                </span>
              </div>
            </div>

            {/* Desktop Run Controls */}
            {!isFinished && (
              <div className="hidden sm:flex pt-4 mt-3 border-t border-border items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePauseResume}
                  className="text-xs min-h-[44px]"
                >
                  {progress.state === "paused" ? (
                    <>
                      <Play className="w-3.5 h-3.5 mr-1 text-success" />
                      Resume Execution
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 mr-1 text-warning" />
                      Pause Execution
                    </>
                  )}
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleCancel}
                  className="text-xs min-h-[44px]"
                >
                  <StopCircle className="w-3.5 h-3.5 mr-1" />
                  Cancel Execution
                </Button>
              </div>
            )}
          </Card>

          {/* Completion Summary & Post-Run Actions (Stacked with Logout first) */}
          {isFinished && (
            <Card className="p-4 sm:p-5 border-emerald-200 bg-emerald-50/40 text-left space-y-3">
              <div className="flex items-center gap-2 text-success font-bold text-base">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Process Complete</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Processed {progress.completed} of {total} conversations. Removed from your personal account view only.
              </p>

              <div className="flex flex-col gap-2 pt-2 border-t border-emerald-200/60">
                {/* 1. Log out this session on Telegram FIRST */}
                <Button
                  size="md"
                  variant="danger"
                  isLoading={isLoggingOut}
                  onClick={handleLogout}
                  className="w-full font-semibold min-h-[44px]"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out this session on Telegram
                </Button>

                <Button
                  size="md"
                  variant="primary"
                  onClick={handleBackToDashboard}
                  className="w-full min-h-[44px]"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back to Dashboard
                </Button>

                {progress.failed > 0 && (
                  <Button
                    size="md"
                    variant="outline"
                    onClick={handleRetryFailed}
                    className="w-full min-h-[44px]"
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5" />
                    Retry {progress.failed} Failed Item{progress.failed > 1 ? "s" : ""}
                  </Button>
                )}

                <Button
                  size="md"
                  variant="outline"
                  onClick={() => handleDownloadSummary("csv")}
                  className="w-full text-xs min-h-[44px]"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1.5 text-text-muted" />
                  Download CSV Audit Summary
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Live Audit Log Section */}
        <div className="md:col-span-7 space-y-2 text-left">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text">
              Activity Log ({progress.results.length})
            </h2>
            <span className="text-[11px] text-text-muted">Live event stream</span>
          </div>

          <Card className="p-0 overflow-hidden border-border bg-surface">
            <div className="h-[280px] sm:h-[calc(100vh-320px)] sm:min-h-[440px] overflow-y-auto overscroll-contain divide-y divide-border text-xs font-mono">
              {progress.results.length === 0 ? (
                <div className="p-12 text-center text-text-muted font-sans text-xs flex flex-col items-center justify-center h-full">
                  Waiting for first operation to execute...
                </div>
              ) : (
                progress.results.map((res) => (
                  <div
                    key={res.id}
                    className="px-3.5 py-2.5 flex items-center justify-between gap-2.5 hover:bg-surface-muted/30 transition-colors min-h-[44px]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {res.status === "success" && (
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      )}
                      {res.status === "failed" && (
                        <XCircle className="w-4 h-4 text-danger shrink-0" />
                      )}
                      {res.status === "skipped" && (
                        <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                      )}

                      <span className="font-semibold text-text truncate max-w-[110px] xs:max-w-[180px] sm:max-w-md">
                        {res.name}
                      </span>

                      {res.reason && (
                        <span className="text-[11px] text-danger truncate max-w-[90px] xs:max-w-[140px]">
                          : {res.reason}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={
                          res.status === "success"
                            ? "success"
                            : res.status === "failed"
                            ? "danger"
                            : "secondary"
                        }
                        className="text-[10px] py-0 px-1.5 uppercase"
                      >
                        {res.status}
                      </Badge>
                      <span className="text-[10px] text-slate-400 tnum">
                        {new Date(res.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile Run Controls */}
      {!isFinished && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={handlePauseResume}
            className="flex-1 min-h-[44px] text-xs font-semibold"
          >
            {progress.state === "paused" ? (
              <>
                <Play className="w-3.5 h-3.5 mr-1 text-success" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 mr-1 text-warning" />
                Pause
              </>
            )}
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={handleCancel}
            className="flex-1 min-h-[44px] text-xs font-semibold"
          >
            <StopCircle className="w-3.5 h-3.5 mr-1" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
