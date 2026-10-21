import React from "react";
import Link from "next/link";
import { Lock, Github, ExternalLink } from "@/components/ui/Icons";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface py-6 px-4 sm:px-8 lg:px-12 text-xs text-text-muted mt-auto">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-center md:text-left">
          <Lock className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong>Client-Only Architecture:</strong> Your API credentials, login codes, passwords, and session strings never leave your browser.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-5 justify-center md:justify-end">
          <Link href="/about" className="hover:text-text transition-colors">
            About
          </Link>

          <Link href="/privacy" className="hover:text-text transition-colors">
            Privacy Policy
          </Link>

          <Link href="/terms" className="hover:text-text transition-colors">
            Terms of Service
          </Link>

          <Link href="/license" className="hover:text-text transition-colors">
            License
          </Link>

          <a
            href="https://github.com/Srishanth-023/Telegram-Chat-Cleaner"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-text transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Source</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="w-full mt-4 pt-4 border-t border-slate-200 text-[11px] text-slate-500 text-center">
        Disclaimer: This is an unofficial open-source utility. It connects directly to Telegram API via WebSockets. Telegram is a trademark of Telegram FZ-LLC.
      </div>
    </footer>
  );
}
