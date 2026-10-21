import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  UserX,
  Code2,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Lock,
  EyeOff,
  Radio,
  Archive,
  Bot,
  Users,
  Check,
} from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16 w-full">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary-soft text-primary text-xs font-semibold mb-6 border border-primary/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Client-Side Architecture: Zero Backend Storage</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text leading-[1.15] mb-6">
          Clean unwanted Telegram chats{" "}
          <span className="text-primary block sm:inline">from your account only.</span>
        </h1>

        <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-2xl mx-auto mb-8">
          A secure, high-performance web tool connecting directly to Telegram via your browser.
          Bulk-remove conversations with full review and two-step confirmation. Never deletes for
          the other party.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button href="/connect" size="lg" className="w-full sm:w-auto font-semibold px-8">
            Get Started
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>

          <Button
            href="https://github.com/Srishanth-023/Telegram-Chat-Cleaner"
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Code2 className="w-4 h-4 mr-1 text-text-muted" />
            Audit Source Code
          </Button>
        </div>
      </div>

      {/* Authentic Product Preview (No fake visuals) */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Live Interface Preview
          </span>
          <span className="text-xs text-text-muted font-mono">
            Granular selection with instant review
          </span>
        </div>

        <div className="border border-border rounded-card bg-surface overflow-hidden">
          {/* Simulated Search & Filter Toolbar */}
          <div className="p-4 border-b border-border bg-surface-muted/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="w-full sm:w-72 px-3 py-1.5 border border-border rounded bg-surface text-xs text-text-muted font-mono">
              Search by name or @username...
            </div>
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="px-2.5 py-1 rounded bg-primary text-white font-medium">All (48)</span>
              <span className="px-2.5 py-1 rounded border border-border bg-surface text-text-muted">Private</span>
              <span className="px-2.5 py-1 rounded border border-border bg-surface text-text-muted">Bots</span>
              <span className="px-2.5 py-1 rounded border border-border bg-surface text-text-muted">Groups</span>
              <span className="px-2.5 py-1 rounded border border-border bg-surface text-text-muted">Channels</span>
            </div>
          </div>

          {/* Sample Rows */}
          <div className="divide-y divide-border text-left">
            <div className="p-3.5 flex items-center justify-between bg-primary-soft/30">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded border border-primary bg-primary text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  CN
                </div>
                <div>
                  <div className="text-xs font-semibold text-text">Crypto Signals & News</div>
                  <div className="text-[11px] text-text-muted">@cryptonews_broadcast</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">Channel</Badge>
                <span className="text-[11px] text-text-muted font-mono">3d ago</span>
              </div>
            </div>

            <div className="p-3.5 flex items-center justify-between bg-primary-soft/30">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded border border-primary bg-primary text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
                  SB
                </div>
                <div>
                  <div className="text-xs font-semibold text-text">Spam Alert Bot</div>
                  <div className="text-[11px] text-text-muted">@spambot_notifier</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">Bot</Badge>
                <span className="text-[11px] text-text-muted font-mono">1w ago</span>
              </div>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded border border-border bg-surface" />
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
                  JD
                </div>
                <div>
                  <div className="text-xs font-semibold text-text">John Doe</div>
                  <div className="text-[11px] text-text-muted">@johndoe</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">Private</Badge>
                <span className="text-[11px] text-text-muted font-mono">Yesterday</span>
              </div>
            </div>
          </div>

          {/* Action Strip */}
          <div className="p-3 bg-surface border-t border-border flex items-center justify-between text-xs">
            <span className="font-semibold text-text font-mono">2 conversations selected</span>
            <span className="px-3 py-1 bg-primary text-white rounded font-medium">Review Selection (2)</span>
          </div>
        </div>
      </div>

      {/* 2-Column Architecture & Guarantee Panel (Not 3 in a row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 text-left">
        <Card className="bg-surface border-border">
          <div className="w-9 h-9 rounded bg-primary-soft text-primary flex items-center justify-center mb-3">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-text mb-1.5">Direct Browser Connection</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            All MTProto requests are transmitted directly from your web browser to Telegram WebSocket endpoints.
            No server proxy, external database, telemetry SDK, or intermediary touches your credentials.
          </p>
        </Card>

        <Card className="bg-surface border-border">
          <div className="w-9 h-9 rounded bg-emerald-100 text-success flex items-center justify-center mb-3">
            <UserX className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-text mb-1.5">Never Deletes for Others</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Every removal operation enforces the strict parameter <code className="font-mono text-text bg-surface-muted px-1 py-0.5 rounded">revoke: false</code>.
            Conversations disappear solely from your personal account view while remaining intact for counterparties.
          </p>
        </Card>
      </div>

      {/* Step-by-Step Credentials Guide (Vertical sequential list) */}
      <Card className="mb-16 text-left border-border bg-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
          <div>
            <h2 className="text-lg font-bold text-text">How to Get Your Telegram API Credentials</h2>
            <p className="text-xs text-text-muted">
              Telegram provides official personal API keys to all users for custom client tools.
            </p>
          </div>
          <Badge variant="primary" className="self-start sm:self-auto">
            Takes ~60 seconds
          </Badge>
        </div>

        <div className="space-y-4 pt-6">
          <div className="p-4 border border-border rounded bg-surface-muted/30 flex items-start gap-3">
            <div className="w-6 h-6 rounded bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text mb-0.5">Sign in to my.telegram.org</h4>
              <p className="text-xs text-text-muted leading-relaxed mb-1.5">
                Open Telegram&apos;s developer portal and sign in with your phone number and SMS code.
              </p>
              <a
                href="https://my.telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary font-medium inline-flex items-center gap-1 hover:underline"
              >
                my.telegram.org <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-4 border border-border rounded bg-surface-muted/30 flex items-start gap-3">
            <div className="w-6 h-6 rounded bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text mb-0.5">Create an API Application</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Click <strong>API development tools</strong>. Enter an App title (e.g. <em>MyCleaner</em>) and short name, select Desktop or Web, and submit.
              </p>
            </div>
          </div>

          <div className="p-4 border border-border rounded bg-surface-muted/30 flex items-start gap-3">
            <div className="w-6 h-6 rounded bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text mb-0.5">Copy App ID and App Hash</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Copy your numeric <strong>App api_id</strong> and 32-character hexadecimal <strong>App api_hash</strong> into the connection wizard.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Radio className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <span>
            <strong>Note on login notices:</strong> Telegram will send you an official security alert: &quot;A new login occurred on Telegram Web&quot;. This is standard and confirms that your browser established a direct connection.
          </span>
        </div>
      </Card>

      {/* FAQ Section */}
      <div id="faq" className="text-left space-y-4">
        <h2 className="text-xl font-bold text-text">Frequently Asked Questions</h2>

        <div className="space-y-3">
          <details className="group border border-border rounded bg-surface p-4 transition-colors open:bg-surface-muted/40">
            <summary className="font-semibold text-sm text-text cursor-pointer list-none flex items-center justify-between">
              <span>How is my session and login data handled?</span>
              <ChevronRight className="w-4 h-4 text-text-muted group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-2.5 text-xs text-text-muted leading-relaxed">
              All credentials stay strictly in your browser memory and are never sent to any server. When you close the tab, everything is erased immediately. If you enable &quot;Remember me&quot;, the session is encrypted locally on your device using native WebCrypto.
            </p>
          </details>

          <details className="group border border-border rounded bg-surface p-4 transition-colors open:bg-surface-muted/40">
            <summary className="font-semibold text-sm text-text cursor-pointer list-none flex items-center justify-between">
              <span>Will the other person see that I deleted our chat?</span>
              <ChevronRight className="w-4 h-4 text-text-muted group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-2.5 text-xs text-text-muted leading-relaxed">
              No. Deletions apply strictly to your own account view (<code className="font-mono text-text">revoke: false</code>). All messages remain completely intact for the other person or group members.
            </p>
          </details>

          <details className="group border border-border rounded bg-surface p-4 transition-colors open:bg-surface-muted/40">
            <summary className="font-semibold text-sm text-text cursor-pointer list-none flex items-center justify-between">
              <span>What happens if I remove a channel or group I own?</span>
              <ChevronRight className="w-4 h-4 text-text-muted group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-2.5 text-xs text-text-muted leading-relaxed">
              You will leave the chat and it will disappear from your account. The chat continues to exist normally for all other members and subscribers.
            </p>
          </details>

          <details className="group border border-border rounded bg-surface p-4 transition-colors open:bg-surface-muted/40">
            <summary className="font-semibold text-sm text-text cursor-pointer list-none flex items-center justify-between">
              <span>Can I undo a chat removal?</span>
              <ChevronRight className="w-4 h-4 text-text-muted group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-2.5 text-xs text-text-muted leading-relaxed">
              No. Removals are permanent on your account. To converse again, you will need to start a new chat or rejoin using an invite link.
            </p>
          </details>
        </div>

        <div className="pt-6 text-center">
          <Button href="/connect" size="lg" className="font-semibold">
            Connect to Telegram
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </main>
  );
}
