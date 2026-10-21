"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSessionState, touchActivity, clearInMemorySession } from "./store";
import { disconnectClient } from "../telegram/client";
import { forgetDevice } from "./persist";
import { useAppStore } from "../store";
import { useToast } from "@/components/ui/Toast";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_THRESHOLD_MS = 14 * 60 * 1000; // 14 minutes (1 min before disconnect)

export function useInactivityTimeout() {
  const router = useRouter();
  const { toast } = useToast();
  const warningShownRef = useRef(false);
  const resetAllStore = useAppStore((s) => s.resetAll);

  useEffect(() => {
    const handleUserInteraction = () => {
      touchActivity();
      warningShownRef.current = false;
    };

    window.addEventListener("mousemove", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);
    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("touchstart", handleUserInteraction);
    window.addEventListener("scroll", handleUserInteraction);

    const interval = setInterval(async () => {
      const session = getSessionState();
      if (!session.isConnected) return;

      const elapsed = Date.now() - session.lastActiveTimestamp;

      if (elapsed >= WARNING_THRESHOLD_MS && !warningShownRef.current) {
        warningShownRef.current = true;
        toast({
          title: "Inactivity Security Alert",
          description: "You have been inactive. For your protection, your local session will disconnect in 60 seconds.",
          variant: "warning",
        });
      }

      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        warningShownRef.current = false;
        try {
          await disconnectClient();
          await forgetDevice();
        } catch {
          // ignore
        }
        clearInMemorySession();
        resetAllStore();

        toast({
          title: "Session Terminated",
          description: "Disconnected due to 15 minutes of inactivity. All memory data cleared.",
          variant: "danger",
        });

        router.push("/connect");
      }
    }, 15000);

    return () => {
      window.removeEventListener("mousemove", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("scroll", handleUserInteraction);
      clearInterval(interval);
    };
  }, [router, toast, resetAllStore]);
}
