import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon, ShieldCheck, Lock, EyeOff, Code2 } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Privacy Policy: Telegram Chat Cleaner",
  description:
    "Zero-server, zero-telemetry, client-only privacy policy for Telegram Chat Cleaner.",
};

export default function PrivacyPage() {
  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 flex-1">
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
          Effective date: October 2026. Zero telemetry, zero external storage, client-side only.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Privacy Summary & Quick Navigation */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4 text-left">
          <div className="p-5 rounded-card bg-surface border border-border space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text block">
              Policy Sections
            </span>
            <nav className="space-y-2 text-xs font-medium">
              <a href="#zero-backend" className="block text-text-muted hover:text-primary transition-colors">
                1. Zero Backend Architecture
              </a>
              <a href="#no-data" className="block text-text-muted hover:text-primary transition-colors">
                2. Data We Do Not Collect
              </a>
              <a href="#crypto" className="block text-text-muted hover:text-primary transition-colors">
                3. Browser Storage &amp; Cryptography
              </a>
              <a href="#secret-protection" className="block text-text-muted hover:text-primary transition-colors">
                4. Secret Protection in Code
              </a>
              <a href="#audits" className="block text-text-muted hover:text-primary transition-colors">
                5. Independent Verification
              </a>
            </nav>
          </div>

          <div className="p-5 rounded-card bg-surface border border-border space-y-3 text-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-text block">
              Data Collection Matrix
            </span>
            <div className="space-y-2 text-text-muted">
              <div className="flex justify-between py-1 border-b border-border">
                <span>API ID &amp; Hash</span>
                <strong className="text-text font-mono text-[11px]">RAM only</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span>Phone &amp; SMS Code</span>
                <strong className="text-text font-mono text-[11px]">Never stored</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span>2FA Password</span>
                <strong className="text-text font-mono text-[11px]">Never stored</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span>Message Contents</span>
                <strong className="text-text font-mono text-[11px]">Never read</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Analytics / Pixels</span>
                <strong className="text-text font-mono text-[11px]">None</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: In-depth Privacy Content */}
        <div className="lg:col-span-8 space-y-6 text-sm text-text-muted leading-relaxed text-left">
          <section id="zero-backend" className="bg-surface border border-border rounded-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              1. Core Architectural Guarantee: Zero Backend
            </h2>
            <p className="mb-3">
              Telegram Chat Cleaner does not possess a backend server, database, middleman proxy, or API gateway.
              The hosting provider serves only static HTML, JavaScript, and CSS assets.
            </p>
            <p>
              When you enter your credentials or connect to Telegram, your browser initiates a direct WebSocket
              connection to Telegram&apos;s data centers (such as venus.web.telegram.org). No information passes
              through any intermediary server.
            </p>
          </section>

          <section id="no-data" className="bg-surface border border-border rounded-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-primary" />
              2. Data We Do Not Collect
            </h2>
            <p className="mb-3">
              Because this application runs entirely in your local browser, the developers and maintainers have no technical
              means to collect or view your data:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>We do not collect or log your API ID, API Hash, or phone number.</li>
              <li>We do not record your verification codes or 2FA passwords.</li>
              <li>We do not record message history, chat lists, contact lists, or account metadata.</li>
              <li>We do not embed third-party analytics (such as Google Analytics, PostHog, or Mixpanel).</li>
              <li>We do not use advertising networks, tracking beacons, or cross-site fingerprinting libraries.</li>
            </ul>
          </section>

          <section id="crypto" className="bg-surface border border-border rounded-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
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

          <section id="secret-protection" className="bg-surface border border-border rounded-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" />
              4. Secret Protection in Code
            </h2>
            <p className="mb-3">
              The project enforces an automated test suite verifying that no calls to console.log, console.warn,
              or console.error output Telegram credentials, session strings, or auth codes.
            </p>
            <p>
              GramJS client logs are suppressed at the library level so internal MTProto handshakes and session tokens
              remain hidden from devtools logs.
            </p>
          </section>

          <section id="audits" className="bg-surface border border-border rounded-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              5. Independent Code Audits
            </h2>
            <p>
              Because this application is 100% open source and statically exported, you can audit the source code,
              inspect browser network requests via Developer Tools, or host your own copy via GitHub Pages or any
              static file server.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
