"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  StopCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Download,
  ArrowLeft,
  LogOut,
  RefreshCw,
  Shield,
  FileSpreadsheet,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { removalQueue, QueueProgress, ItemResult } from "@/lib/telegram/queue";
import { disconnectClient } from "@/lib/telegram/client";
import { forgetDevice } from "@/lib/session/persist";
import { clearInMemorySession } from "@/lib/session/store";
import { isAuthenticated } from "@/lib/security/guards";
import { Api } from "telegram";
import { getClient } from "@/lib/telegram/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { clsx } from "clsx";

export function ProgressView() {
  const router = useRouter();
  const { chats, selectedIds, clearSelection, setChats } = useAppStore();

  const [progress, setProgress] = useState<QueueProgress>(removalQueue.getProgress());
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Re-read selected items from store
  const selectedChats = useMemo(() => {
    return chats.filter((c) => selectedIds.has(c.id) && !c.isProtected);
  }, [chats, selectedIds]);

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
  const remainingCount = total - progress.completed;
  const estimatedSeconds = Math.max(0, Math.ceil(remainingCount * 0.6));

  const handlePauseResume = () => {
    if (progress.state === "running") {
      removalQueue.pause();
    } else if (progress.state === "paused") {
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
    // Clear selection of removed chats
    clearSelection();
    router.push("/dashboard");
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const client = getClient();
      if (client && client.connected) {
        try {
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
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 pb-24 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
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

      {/* Flood-Wait Live Alert */}
      {progress.remainingSecondsWait && progress.remainingSecondsWait > 0 && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-card bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-4 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-warning shrink-0" />
            <div>
              <strong className="text-sm font-semibold block">
                Telegram Rate Limit (Flood Wait)
              </strong>
              <p className="text-xs text-amber-800">
                Telegram asked us to wait {progress.remainingSecondsWait}s before continuing. Retrying automatically.
              </p>
            </div>
          </div>
          <span className="tnum text-xl font-bold font-mono text-warning bg-amber-100 px-3 py-1 rounded-control border border-amber-200">
            {progress.remainingSecondsWait}s
          </span>
        </div>
      )}

      {/* Active Run Card */}
      <Card className="mb-6 bg-surface border-border shadow-xs p-6">
        {/* Progress Bar & Current Operation */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-text">Overall Progress</span>
            <span className="tnum text-primary font-bold">{percent}%</span>
          </div>
          <Progress value={percent} className="h-3" />
        </div>

        {/* Current Chat Indicator */}
        {!isFinished && progress.currentItem && (
          <div className="p-3 rounded-control bg-surface-muted border border-border flex items-center justify-between gap-3 text-xs mb-4">
            <div className="flex items-center gap-2 truncate">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="text-text-muted">Processing:</span>
              <strong className="text-text font-semibold truncate">
                {progress.currentItem.name}
              </strong>
              <span className="text-slate-400 capitalize">({progress.currentItem.kind})</span>
            </div>

            <span className="tnum text-text-muted shrink-0 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              ~{estimatedSeconds}s remaining
            </span>
          </div>
        )}

        {/* Counter Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2 border-t border-border">
          <div className="p-2.5 rounded-control bg-surface-muted/50">
            <span className="text-[11px] text-text-muted font-medium uppercase tracking-wider block">
              Removed
            </span>
            <span className="tnum text-lg font-bold text-success">
              {progress.successful}
            </span>
          </div>

          <div className="p-2.5 rounded-control bg-surface-muted/50">
            <span className="text-[11px] text-text-muted font-medium uppercase tracking-wider block">
              Failed
            </span>
            <span className="tnum text-lg font-bold text-danger">
              {progress.failed}
            </span>
          </div>

          <div className="p-2.5 rounded-control bg-surface-muted/50">
            <span className="text-[11px] text-text-muted font-medium uppercase tracking-wider block">
              Skipped
            </span>
            <span className="tnum text-lg font-bold text-slate-500">
              {progress.skipped}
            </span>
          </div>

          <div className="p-2.5 rounded-control bg-surface-muted/50">
            <span className="text-[11px] text-text-muted font-medium uppercase tracking-wider block">
              Remaining
            </span>
            <span className="tnum text-lg font-bold text-text">
              {Math.max(0, total - progress.completed)}
            </span>
          </div>
        </div>

        {/* Run Controls */}
        {!isFinished && (
          <div className="pt-6 mt-4 border-t border-border flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePauseResume}
              className="text-xs"
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
              className="text-xs"
            >
              <StopCircle className="w-3.5 h-3.5 mr-1" />
              Cancel Execution
            </Button>
          </div>
        )}
      </Card>

      {/* Completion Summary & Post-Run Actions */}
      {isFinished && (
        <Card className="mb-6 p-6 border-emerald-200 bg-emerald-50/40 text-left">
          <div className="flex items-center gap-2 text-success font-bold text-base mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Process Complete</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed mb-4">
            Successfully processed {progress.completed} of {total} conversations. Unwanted chats have been removed from your personal Telegram view with zero impact on other participants.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="md" variant="primary" onClick={handleBackToDashboard}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Dashboard
            </Button>

            {progress.failed > 0 && (
              <Button size="md" variant="outline" onClick={handleRetryFailed}>
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Retry {progress.failed} Failed Item{progress.failed > 1 ? "s" : ""}
              </Button>
            )}

            <Button
              size="md"
              variant="outline"
              onClick={() => handleDownloadSummary("csv")}
              className="text-xs"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-text-muted" />
              Download CSV Summary
            </Button>

            <Button
              size="md"
              variant="ghost"
              isLoading={isLoggingOut}
              onClick={handleLogout}
              className="text-xs text-danger hover:bg-red-50 hover:text-danger ml-auto"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Log Out Session
            </Button>
          </div>
        </Card>
      )}

      {/* Live Audit Log Section */}
      <div className="text-left">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text">
            Activity Log ({progress.results.length})
          </h3>
          <span className="text-[11px] text-text-muted">Live event stream</span>
        </div>

        <Card className="p-0 overflow-hidden border-border bg-surface">
          <div className="max-h-[340px] overflow-auto divide-y divide-border text-xs font-mono">
            {progress.results.length === 0 ? (
              <div className="p-6 text-center text-text-muted font-sans text-xs">
                Waiting for first operation to execute...
              </div>
            ) : (
              progress.results.map((res) => (
                <div
                  key={res.id}
                  className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-surface-muted/30 transition-colors"
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

                    <span className="font-semibold text-text truncate max-w-[200px] sm:max-w-md">
                      {res.name}
                    </span>

                    {res.reason && (
                      <span className="text-[11px] text-danger truncate">
                        — {res.reason}
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
  );
}
