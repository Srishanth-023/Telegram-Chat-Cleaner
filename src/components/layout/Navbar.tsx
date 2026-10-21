"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { clsx } from "clsx";
import { ShieldCheck, LogOut, Trash2, UserCheck, ChevronDown } from "@/components/ui/Icons";
import { getSessionState, subscribeSession, clearInMemorySession } from "@/lib/session/store";
import { disconnectClient } from "@/lib/telegram/client";
import { forgetDevice } from "@/lib/session/persist";
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

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = React.useRef(0);

  // Global inactivity timer
  useInactivityTimeout();

  useEffect(() => {
    if (pathname !== "/dashboard") {
      setIsHeaderVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 60 && currentScrollY > lastScrollY.current + 8) {
        setIsHeaderVisible(false); // scrolling down
      } else if (currentScrollY < lastScrollY.current - 8 || currentScrollY <= 20) {
        setIsHeaderVisible(true); // scrolling up
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    // Prefetch all primary navigation routes
    router?.prefetch?.("/connect");
    router?.prefetch?.("/about");
    router?.prefetch?.("/privacy");
    router?.prefetch?.("/terms");

    return subscribeSession((state) => {
      setSession(state);
    });
  }, [router]);

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
          const { Api } = await import("telegram");
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
      <header
        className={clsx(
          "sticky top-0 z-40 w-full border-b border-border bg-surface transition-transform duration-200 pt-[env(safe-area-inset-top)]",
          pathname === "/dashboard" && !isHeaderVisible && "-translate-y-full sm:translate-y-0"
        )}
      >
        <div className="w-full px-3 sm:px-8 lg:px-12 h-14 sm:h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-control py-1"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-control bg-primary text-white flex items-center justify-center font-bold text-xs sm:text-sm group-hover:bg-primary-hover transition-colors shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-text text-xs sm:text-base tracking-tight leading-none">
                Telegram Chat Cleaner
              </span>
              <span className="text-[9px] sm:text-[10px] text-text-muted font-medium uppercase tracking-wider mt-0.5">
                Client-Side Only
              </span>
            </div>
          </Link>

          {/* Right-aligned Navigation Links and Actions */}
          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="hidden sm:flex items-center gap-4 lg:gap-6 text-xs font-medium text-text-muted">
              <Link
                href="/about"
                className={clsx(
                  "hover:text-text transition-colors py-2",
                  pathname === "/about" && "text-primary font-semibold"
                )}
              >
                About
              </Link>
              <Link
                href="/privacy"
                className={clsx(
                  "hover:text-text transition-colors py-2",
                  pathname === "/privacy" && "text-primary font-semibold"
                )}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className={clsx(
                  "hover:text-text transition-colors py-2",
                  pathname === "/terms" && "text-primary font-semibold"
                )}
              >
                Terms
              </Link>
            </nav>

            {session.isConnected && <div className="h-4 w-px bg-border hidden sm:block" />}

            <div className="flex items-center gap-2">
              {session.isConnected && displayName ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDisconnectOpen(true)}
                    className="flex items-center gap-1.5 sm:gap-2 min-h-[44px] px-2.5 sm:px-3 py-1.5 rounded-control border border-border bg-surface hover:bg-surface-muted transition-colors text-xs font-medium text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Account session menu"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-success shrink-0" />
                    <span className="hidden sm:inline font-mono">{displayName}</span>
                    <span className="inline sm:hidden font-mono max-w-[100px] truncate">{displayName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  </button>
                </div>
              ) : pathname !== "/connect" && (
                <Button href="/connect" size="sm" variant="primary">
                  Connect Account
                </Button>
              )}
            </div>
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
