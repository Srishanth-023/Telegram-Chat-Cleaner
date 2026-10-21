"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShieldCheck, LogOut, Trash2, UserCheck, ChevronDown } from "@/components/ui/Icons";
import { getSessionState, subscribeSession, clearInMemorySession } from "@/lib/session/store";
import { disconnectClient } from "@/lib/telegram/client";
import { forgetDevice } from "@/lib/session/persist";
import { Api } from "telegram";
import { getClient } from "@/lib/telegram/client";
import { useAppStore } from "@/lib/store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

import { useToast } from "../ui/Toast";
import { useInactivityTimeout } from "@/lib/session/useInactivityTimeout";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState(getSessionState());
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const resetAllStore = useAppStore((s) => s.resetAll);

  // Global inactivity timer
  useInactivityTimeout();

  useEffect(() => {
    return subscribeSession((state) => {
      setSession(state);
    });
  }, []);

  const handleDisconnectOnly = async () => {
    try {
      await disconnectClient();
      await forgetDevice();
      clearInMemorySession();
      resetAllStore();
      setIsDisconnectOpen(false);
      router.push("/connect");
    } catch {
      // Complete cleanup regardless
      clearInMemorySession();
      resetAllStore();
      setIsDisconnectOpen(false);
      router.push("/connect");
    }
  };

  const handleFullTelegramLogout = async () => {
    setIsLoggingOut(true);
    try {
      const client = getClient();
      if (client && client.connected) {
        try {
          await client.invoke(new Api.auth.LogOut());
        } catch {
          // Ignore RPC logout error if session already revoked
        }
      }
      await disconnectClient();
      await forgetDevice();
      clearInMemorySession();
      resetAllStore();
      setIsDisconnectOpen(false);
      router.push("/connect");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = session.user
    ? session.user.username
      ? `@${session.user.username}`
      : `${session.user.firstName} ${session.user.lastName || ""}`.trim()
    : null;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-control"
          >
            <div className="w-8 h-8 rounded-control bg-primary text-white flex items-center justify-center font-bold text-sm group-hover:bg-primary-hover transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-text text-sm sm:text-base tracking-tight leading-none">
                Telegram Chat Cleaner
              </span>
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider mt-0.5">
                Client-Side Only
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-text-muted">
            <Link href="/about" className="hover:text-text transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-text transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-text transition-colors">
              Terms
            </Link>
            <Link href="/license" className="hover:text-text transition-colors">
              License
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {session.isConnected && displayName ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDisconnectOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-control border border-border bg-surface hover:bg-surface-muted transition-colors text-xs font-medium text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <UserCheck className="w-3.5 h-3.5 text-success" />
                  <span className="hidden sm:inline font-mono">{displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                </button>
              </div>
            ) : pathname !== "/connect" && (
              <Link href="/connect">
                <Button size="sm" variant="primary">
                  Connect Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Disconnect & Logout Dialog */}
      <Dialog open={isDisconnectOpen} onOpenChange={setIsDisconnectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Account Session</DialogTitle>
            <DialogDescription>
              Connected as <strong className="text-text font-mono">{displayName}</strong>. Choose an action:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="p-3.5 rounded-control border border-border bg-surface-muted text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-text">Disconnect Local Session</span>
                <Badge variant="secondary">Wipes device data</Badge>
              </div>
              <p className="text-xs text-text-muted leading-relaxed mb-3">
                Disconnects the WebSocket client and removes all in-memory conversations and keys from your browser. Your Telegram authorization remains active for future logins.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectOnly}
                className="w-full text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5 text-text-muted" />
                Disconnect & Clear Local Memory
              </Button>
            </div>

            <div className="p-3.5 rounded-control border border-red-200 bg-danger-soft text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-danger">Log Out on Telegram</span>
                <Badge variant="danger">Terminates session</Badge>
              </div>
              <p className="text-xs text-text-muted leading-relaxed mb-3">
                Explicitly sends an <code className="font-mono text-text">auth.logOut</code> call to Telegram to invalidate this application session on Telegram servers, then wipes all local data.
              </p>
              <Button
                variant="danger"
                size="sm"
                isLoading={isLoggingOut}
                onClick={handleFullTelegramLogout}
                className="w-full text-xs"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Log Out Completely from Telegram
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
