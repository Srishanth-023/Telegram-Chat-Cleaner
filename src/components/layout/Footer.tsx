import React from "react";
import Link from "next/link";
import { Lock, Github, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface py-8 px-4 text-xs text-text-muted mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-center md:text-left">
          <Lock className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong>Client-Only Architecture:</strong> Your API credentials, login codes, passwords, and session strings never leave your browser.
          </span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/Srishanth-023/Telegram-Chat-Cleaner"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-text transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>View Source</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <Link href="/#faq" className="hover:text-text transition-colors">
            Privacy & FAQ
          </Link>

          <a
            href="https://github.com/Srishanth-023/Telegram-Chat-Cleaner/blob/main/docs/SECURITY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition-colors"
          >
            Security
          </a>

          <span>MIT License</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        Disclaimer: This is an unofficial open-source utility. It connects directly to Telegram API via WebSockets. Telegram is a trademark of Telegram FZ-LLC.
      </div>
    </footer>
  );
}
