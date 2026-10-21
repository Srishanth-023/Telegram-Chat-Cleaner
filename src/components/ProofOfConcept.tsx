"use client";

import React, { useState } from "react";
import { createTelegramClient, disconnectClient } from "@/lib/telegram/client";
import { authBridge } from "@/lib/telegram/auth";

export function ProofOfConcept() {
  const [status, setStatus] = useState<string>("Ready to test GramJS proof of concept");

  const testInit = async () => {
    try {
      setStatus("Initializing client...");
      await createTelegramClient({
        apiId: "123456",
        apiHash: "0123456789abcdef0123456789abcdef",
      });
      setStatus("GramJS TelegramClient instance created successfully with WebSockets enabled!");
      await disconnectClient();
    } catch (err: unknown) {
      setStatus(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="p-4 border border-border rounded-card bg-surface max-w-md mx-auto my-8">
      <h2 className="text-lg font-semibold mb-2">Phase 1: GramJS Browser POC</h2>
      <p className="text-sm text-text-muted mb-4">{status}</p>
      <button
        onClick={testInit}
        className="px-4 py-2 bg-primary text-white rounded-control hover:bg-primary-hover text-sm font-medium"
      >
        Test Client Creation
      </button>
    </div>
  );
}
