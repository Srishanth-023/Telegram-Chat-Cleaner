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
    <main className="flex-1 max-w-7xl mx-auto px-3 xs:px-4 sm:px-8 lg:px-12 py-8 xs:py-12 sm:py-16 pb-24 sm:pb-16 w-full">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary-soft text-primary text-xs font-semibold mb-6 border border-primary/20">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span className="truncate">Client-Side Architecture: Zero Backend</span>
        </div>

        <h1 className="text-2xl xs:text-3xl sm:text-5xl font-extrabold tracking-tight text-text leading-[1.15] mb-4 sm:mb-6">
          Clean unwanted Telegram chats{" "}
          <span className="text-primary block sm:inline">from your account only.</span>
        </h1>

        <p className="text-sm sm:text-lg text-text-muted leading-relaxed max-w-2xl mx-auto mb-6 sm:mb-8">
          A secure, high-performance web tool connecting directly to Telegram via your browser.
          Bulk-remove conversations with full review and two-step confirmation. Never deletes for
          the other party.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button href="/connect" size="lg" className="w-full sm:w-auto font-semibold px-8 min-h-[44px]">
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
            <div className="p-3 sm:p-3.5 flex items-center justify-between bg-primary-soft/30 gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-4 h-4 rounded border border-primary bg-primary text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                  CN
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-text truncate max-w-[110px] xs:max-w-[180px] sm:max-w-md">Crypto Signals & News</div>
                  <div className="text-[11px] text-text-muted truncate max-w-[110px] xs:max-w-[180px] sm:max-w-md">@cryptonews_broadcast</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-[10px]">Channel</Badge>
                <span className="text-[11px] text-text-muted font-mono">3d ago</span>
              </div>
            </div>

            <div className="p-3 sm:p-3.5 flex items-center justify-between bg-primary-soft/30 gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-4 h-4 rounded border border-primary bg-primary text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                  SB
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-text truncate max-w-[110px] xs:max-w-[180px] sm:max-w-md">Spam Alert Bot</div>
                  <div className="text-[11px] text-text-muted truncate max-w-[110px] xs:max-w-[180px] sm:max-w-md">@spambot_notifier</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-[10px]">Bot</Badge>
                <span className="text-[11px] text-text-muted font-mono">1w ago</span>
              </div>
            </div>

            <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-4 h-4 rounded border border-border bg-surface shrink-0" />
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                  JD
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-text truncate max-w-[110px] xs:max-w-[180px] sm:max-w-md">John Doe</div>
                  <div className="text-[11px] text-text-muted truncate max-w-[110px] xs:max-w-[180px] sm:max-w-md">@johndoe</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-[10px]">Private</Badge>
                <span className="text-[11px] text-text-muted font-mono">Yesterday</span>
              </div>
            </div>
          </div>

          {/* Action Strip */}
          <div className="p-3 bg-surface border-t border-border flex items-center justify-between text-xs gap-2">
            <span className="font-semibold text-text font-mono truncate">2 conversations selected</span>
            <span className="px-3 py-1 bg-primary text-white rounded font-medium shrink-0">Review Selection (2)</span>
          </div>
        </div>
      </div>

      {/* 3 Trust Points (Stacked as cards on mobile, 3-col on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16 text-left">
        <Card className="bg-surface border-border p-5">
          <div className="w-9 h-9 rounded bg-primary-soft text-primary flex items-center justify-center mb-3">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-text mb-1.5">Runs in Your Browser</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            All MTProto requests connect directly to Telegram WebSocket endpoints. Zero server proxies, databases, or analytics.
          </p>
        </Card>

        <Card className="bg-surface border-border p-5">
          <div className="w-9 h-9 rounded bg-emerald-100 text-success flex items-center justify-center mb-3">
            <UserX className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-text mb-1.5">Never Deletes for Others</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Hardcodes <code className="font-mono text-text bg-surface-muted px-1 py-0.5 rounded">revoke: false</code>. Removals apply strictly to your personal account view.
          </p>
        </Card>

        <Card className="bg-surface border-border p-5">
          <div className="w-9 h-9 rounded bg-blue-100 text-primary flex items-center justify-center mb-3">
            <Code2 className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-text mb-1.5">Open Source & Inspectable</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            100% client-side TypeScript code. Auditable architecture with zero telemetry or hidden network calls.
          </p>
        </Card>
      </div>

      {/* Step-by-Step Credentials Guide (Numbered Accordion) */}
      <Card className="mb-16 text-left border-border bg-surface p-5 sm:p-6">
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

        <div className="space-y-3 pt-5">
          <details open className="group border border-border rounded bg-surface-muted/30 p-3.5 transition-colors">
            <summary className="font-semibold text-sm text-text cursor-pointer list-none flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <span>Sign in to my.telegram.org</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted group-open:rotate-90 transition-transform" />
            </summary>
            <div className="mt-2.5 pl-9 text-xs text-text-muted leading-relaxed">
              <p className="mb-2">Open Telegram&apos;s developer portal and sign in with your phone number and confirmation code.</p>
              <a
                href="https://my.telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium inline-flex items-center gap-1 hover:underline"
              >
                my.telegram.org <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </details>

          <details open className="group border border-border rounded bg-surface-muted/30 p-3.5 transition-colors">
            <summary className="font-semibold text-sm text-text cursor-pointer list-none flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <span>Create an API Application</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted group-open:rotate-90 transition-transform" />
            </summary>
            <div className="mt-2.5 pl-9 text-xs text-text-muted leading-relaxed">
              Click <strong>API development tools</strong>. Enter an App title (e.g. <em>MyCleaner</em>) and short name, select Desktop or Web, and submit.
            </div>
          </details>

          <details open className="group border border-border rounded bg-surface-muted/30 p-3.5 transition-colors">
            <summary className="font-semibold text-sm text-text cursor-pointer list-none flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <span>Copy App ID and App Hash</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted group-open:rotate-90 transition-transform" />
            </summary>
            <div className="mt-2.5 pl-9 text-xs text-text-muted leading-relaxed">
              Copy your numeric <strong>App api_id</strong> and 32-character hexadecimal <strong>App api_hash</strong> into the connection wizard.
            </div>
          </details>
        </div>

        <div className="mt-5 p-3 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
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

      {/* Sticky Bottom "Get Started" Bar for Mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-surface/95 border-t border-border pb-safe">
        <Button href="/connect" size="lg" className="w-full font-semibold">
          Get Started
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </main>
  );
}
