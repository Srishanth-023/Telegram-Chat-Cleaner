"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSessionState, touchActivity } from "./store";
import { performLogout } from "./logout";
import { useToast } from "@/components/ui/Toast";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_THRESHOLD_MS = 14 * 60 * 1000; // 14 minutes (1 min before disconnect)

export function useInactivityTimeout() {
  const router = useRouter();
  const { toast } = useToast();
  const warningShownRef = useRef(false);

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
        await performLogout({ revokeTelegramSession: false });

        toast({
          title: "Session Timed Out",
          description: "Disconnected due to 15 minutes of inactivity. All memory data cleared.",
          variant: "warning",
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
  }, [router, toast]);
}
