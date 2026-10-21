"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle } from "@/components/ui/Icons";

export function HttpsWarningBanner() {
  const [isHttp, setIsHttp] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "[::1]";
      if (window.location.protocol !== "https:" && !isLocal) {
        setIsHttp(true);
      }
    }
  }, []);

  if (!isHttp) return null;

  return (
    <div
      role="alert"
      className="bg-amber-600 text-white text-xs font-medium px-4 py-2 text-center flex items-center justify-center gap-2"
    >
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>
        <strong>Warning: Insecure Connection.</strong> This application is not being served over HTTPS. To protect your credentials, always access via HTTPS.
      </span>
    </div>
  );
}
