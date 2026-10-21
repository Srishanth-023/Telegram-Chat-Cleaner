import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon, ShieldCheck, Code2, Lock, UserX, ExternalLink } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "About: Telegram Chat Cleaner",
  description:
    "Architecture, motivation, and technology behind Telegram Chat Cleaner.",
};

export default function AboutPage() {
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
          About Telegram Chat Cleaner
        </h1>
        <p className="text-xs text-text-muted mt-2">
          An independent client-only utility designed for high-volume Telegram dialog triage and removal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Quick Navigation & Architectural Overview */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4 text-left">
          <div className="p-5 rounded-card bg-surface border border-border space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text block">
              Quick Navigation
            </span>
            <nav className="space-y-2 text-xs font-medium">
              <a href="#overview" className="block text-text-muted hover:text-primary transition-colors">
                1. Overview and Purpose
              </a>
              <a href="#architecture" className="block text-text-muted hover:text-primary transition-colors">
                2. Key Architectural Decisions
              </a>
              <a href="#stack" className="block text-text-muted hover:text-primary transition-colors">
                3. Complete Technology Stack
              </a>
              <a href="#invariants" className="block text-text-muted hover:text-primary transition-colors">
                4. Mandatory Security Invariants
              </a>
            </nav>
          </div>

          <div className="p-5 rounded-card bg-surface border border-border space-y-3 text-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-text block">
              System Specifications
            </span>
            <div className="space-y-2 text-text-muted">
              <div className="flex justify-between py-1 border-b border-border">
                <span>Architecture</span>
                <strong className="text-text font-mono text-[11px]">100% Client-Side</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span>Network Protocol</span>
                <strong className="text-text font-mono text-[11px]">MTProto 2.0 (WSS)</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span>Backend Servers</span>
                <strong className="text-text font-mono text-[11px]">None (Zero)</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span>Revocation Scope</span>
                <strong className="text-text font-mono text-[11px]">Account Only</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Telemetry / Logs</span>
                <strong className="text-text font-mono text-[11px]">Zero Tracking</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: In-depth Content */}
        <div className="lg:col-span-8 space-y-6 text-sm text-text-muted leading-relaxed text-left">
          <section id="overview" className="bg-surface border border-border rounded-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              1. Overview and Purpose
            </h2>
            <p className="mb-4">
              Over years of daily usage, Telegram accounts accumulate hundreds of abandoned broadcast channels,
              muted group chats, dead automated bots, and obsolete direct message threads.
            </p>
            <p className="mb-4">
              Native Telegram desktop and mobile applications require manual one-by-one deletion or leaving dialogues through
              nested menus. This makes bulk cleanup slow and prone to errors. Telegram Chat Cleaner addresses this by providing
              a fast, dedicated interface with instant search, filter tabs, bulk selection, safety review, and a rate-limited
              execution engine.
            </p>
            <p>
              The application is entirely client-side: there is no backend server, database, or proxy between your browser and Telegram.
            </p>
          </section>

          <section id="architecture" className="bg-surface border border-border rounded-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              2. Key Architectural Decisions
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-text text-sm">Static Client Architecture</h3>
                <p className="mt-1">
                  The application is compiled to static HTML, CSS, and JavaScript. The host serves only static files.
                  All application logic, cryptography, and network requests execute entirely within your browser.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-text text-sm">Direct MTProto via WebSockets</h3>
                <p className="mt-1">
                  Using GramJS, your browser connects directly to official Telegram data centers (e.g. venus.web.telegram.org)
                  over secure WebSockets using Telegram&apos;s binary MTProto wire protocol.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-text text-sm">Non-Revocation Guarantee</h3>
                <p className="mt-1">
                  Every removal operation strictly enforces <code>revoke: false</code>. Removals apply solely to your
                  personal account view, leaving messages intact for the other person or group members.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-text text-sm">Adaptive Rate-Limit Mitigation</h3>
                <p className="mt-1">
                  Sequential deletions run with randomized delays to respect Telegram flood limits. If a <code>FLOOD_WAIT</code> response
                  is received, the queue automatically pauses and resumes once the countdown expires.
                </p>
              </div>
            </div>
          </section>

          <section id="stack" className="bg-surface border border-border rounded-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" />
              3. Complete Technology Stack
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-bg border border-border rounded-card p-3.5">
                <span className="font-semibold text-text block mb-1">Frontend Framework</span>
                Next.js 14 (App Router, Static Export)
              </div>
              <div className="bg-bg border border-border rounded-card p-3.5">
                <span className="font-semibold text-text block mb-1">Telegram Protocol</span>
                GramJS 2.26 (MTProto over WebSocket)
              </div>
              <div className="bg-bg border border-border rounded-card p-3.5">
                <span className="font-semibold text-text block mb-1">Styling &amp; Tokens</span>
                Tailwind CSS (Custom variables, crisp 4px radius)
              </div>
              <div className="bg-bg border border-border rounded-card p-3.5">
                <span className="font-semibold text-text block mb-1">List Virtualization</span>
                TanStack Virtual v3
              </div>
              <div className="bg-bg border border-border rounded-card p-3.5">
                <span className="font-semibold text-text block mb-1">State Management</span>
                Zustand 5 (In-memory stores)
              </div>
              <div className="bg-bg border border-border rounded-card p-3.5">
                <span className="font-semibold text-text block mb-1">Cryptography</span>
                Web Cryptography API (AES-GCM 256-bit)
              </div>
            </div>
          </section>

          <section id="invariants" className="bg-surface border border-border rounded-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
              <UserX className="w-5 h-5 text-primary" />
              4. Mandatory Security Invariants
            </h2>
            <div className="space-y-3">
              <p>
                The codebase enforces strict invariants via automated continuous integration tests:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs">
                <li>
                  <strong>Never Log Secrets</strong>: Automated tests scan all component files to guarantee no credentials, phone numbers, or session strings are printed to browser console or telemetry.
                </li>
                <li>
                  <strong>Never Revoke For Others</strong>: Unit tests verify that every removal API call passes <code>revoke: false</code> or <code>revokeHistory: false</code>.
                </li>
                <li>
                  <strong>Protected System Chats</strong>: Saved Messages and Telegram Service Notifications (ID 777000) are hard-coded as non-selectable and cannot be deleted.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
