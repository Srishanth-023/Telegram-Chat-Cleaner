import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "About: Telegram Chat Cleaner",
  description:
    "Architecture, motivation, and technology behind Telegram Chat Cleaner.",
};

export default function AboutPage() {
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
          About Telegram Chat Cleaner
        </h1>
        <p className="text-xs text-text-muted mt-2">
          A dedicated client-only tool for Telegram dialog organization and cleanup.
        </p>
      </div>

      <div className="space-y-6 text-sm text-text-muted leading-relaxed">
        <section className="bg-surface border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-text mb-3">
            Overview and Purpose
          </h2>
          <p className="mb-3">
            Over years of daily usage, Telegram accounts often collect hundreds of inactive channels,
            dormant groups, automated notification bots, and obsolete direct message threads.
          </p>
          <p>
            Native Telegram clients require manual one-by-one deletion or leaving dialogues through
            nested menus. Telegram Chat Cleaner streamlines this process into a focused, three-stage
            workflow: Connect, Select and Review, and Remove.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-text mb-3">
            Key Architectural Decisions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-text text-sm">Static Client Architecture</h3>
              <p className="mt-1">
                The application compiles to plain static HTML, CSS, and JavaScript. It runs entirely on
                the client side without application servers or background services.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-text text-sm">Direct MTProto via WebSockets</h3>
              <p className="mt-1">
                Using GramJS (the JavaScript implementation of Telethon), the browser establishes an
                encrypted binary MTProto connection directly to Telegram&apos;s data centers.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-text text-sm">Strict Account-Level Scope</h3>
              <p className="mt-1">
                Every deletion command enforces <code>revoke: false</code>. The tool removes dialogues
                exclusively from your account view without impacting other chat participants or revoking shared history.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-text text-sm">Adaptive Rate-Limit Mitigation</h3>
              <p className="mt-1">
                Sequential deletions run with randomized pauses and handle Telegram <code>FLOOD_WAIT</code> responses
                by pausing automatically with clear countdown feedback.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-surface border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-text mb-3">
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-bg border border-border rounded-card p-3">
              <span className="font-semibold text-text block mb-1">Frontend Framework</span>
              Next.js 14 (App Router, Static Export)
            </div>
            <div className="bg-bg border border-border rounded-card p-3">
              <span className="font-semibold text-text block mb-1">Telegram Protocol</span>
              GramJS 2.26 (MTProto over WebSocket)
            </div>
            <div className="bg-bg border border-border rounded-card p-3">
              <span className="font-semibold text-text block mb-1">Styling &amp; Tokens</span>
              Tailwind CSS (Custom variables, crisp 4px radius)
            </div>
            <div className="bg-bg border border-border rounded-card p-3">
              <span className="font-semibold text-text block mb-1">List Virtualization</span>
              TanStack Virtual v3
            </div>
            <div className="bg-bg border border-border rounded-card p-3">
              <span className="font-semibold text-text block mb-1">State Management</span>
              Zustand 5 (In-memory stores)
            </div>
            <div className="bg-bg border border-border rounded-card p-3">
              <span className="font-semibold text-text block mb-1">Cryptography</span>
              Web Cryptography API (AES-GCM 256-bit)
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
