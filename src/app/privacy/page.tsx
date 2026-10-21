import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Privacy Policy: Telegram Chat Cleaner",
  description:
    "Zero-server, zero-telemetry, client-only privacy policy for Telegram Chat Cleaner.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text mb-4 transition-colors font-medium"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5" />
          Back to cleaner
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
          Privacy Policy
        </h1>
        <p className="text-xs text-text-muted mt-2">
          Effective date: October 2026. Zero telemetry, zero external storage.
        </p>
      </div>

      <div className="space-y-6 text-sm text-text-muted leading-relaxed">
        <section className="bg-surface border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-text mb-3">
            1. Core Architectural Guarantee: Zero Backend
          </h2>
          <p className="mb-3">
            Telegram Chat Cleaner does not possess a backend server, database, middleman proxy, or API gateway.
            The hosting provider delivers only static HTML, JavaScript, and CSS assets.
          </p>
          <p>
            When you enter your credentials or connect to Telegram, your browser initiates a direct WebSocket
            connection to Telegram&apos;s data centers (such as venus.web.telegram.org). No information passes
            through any intermediary server.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-text mb-3">
            2. Data We Do Not Collect
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>We do not collect or log your API ID, API Hash, or phone number.</li>
            <li>We do not record your verification codes or 2FA passwords.</li>
            <li>We do not record message history, chat lists, contact lists, or account metadata.</li>
            <li>We do not embed third-party analytics (such as Google Analytics, PostHog, or Mixpanel).</li>
            <li>We do not use advertising networks, tracking beacons, or cross-site fingerprinting libraries.</li>
          </ul>
        </section>

        <section className="bg-surface border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-text mb-3">
            3. Local Browser Storage and Cryptography
          </h2>
          <p className="mb-3">
            By default, all session strings and credentials reside strictly in ephemeral JavaScript memory
            (Zustand stores) and vanish immediately when the tab is closed or reloaded.
          </p>
          <p className="mb-3">
            If you explicitly choose to persist your session between reloads:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Data is encrypted client-side using the native Web Cryptography API (AES-GCM with a 256-bit key).
            </li>
            <li>
              Keys are derived using PBKDF2 with 100,000 iterations and a cryptographically secure random salt.
            </li>
            <li>
              The unencrypted session string is never written to localStorage or cookies.
            </li>
          </ul>
        </section>

        <section className="bg-surface border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-text mb-3">
            4. Secret Protection in Code
          </h2>
          <p>
            The project enforces an automated test suite verifying that no calls to console.log, console.warn,
            or console.error output Telegram credentials, session strings, or auth codes.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-text mb-3">
            5. Independent Code Audits
          </h2>
          <p>
            Because this application is 100% open source and statically exported, you can audit the source code,
            inspect browser network requests via Developer Tools, or host your own copy via GitHub Pages or any
            static file server.
          </p>
        </section>
      </div>
    </main>
  );
}
