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
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-6 border border-primary/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Client-Only Architecture • Zero Backend Storage</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text leading-[1.15] mb-6">
          Clean unwanted Telegram chats{" "}
          <span className="text-primary block sm:inline">from your account only.</span>
        </h1>

        <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-2xl mx-auto mb-8">
          A secure, high-performance web tool that connects directly to Telegram from your browser.
          Bulk-remove conversations with full review and two-step confirmation. Never deletes for
          the other party.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/connect" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto font-semibold px-8 shadow-md">
              Get Started
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>

          <a
            href="https://github.com/Srishanth-023/Telegram-Chat-Cleaner"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Code2 className="w-4 h-4 mr-1 text-text-muted" />
              Audit Source Code
            </Button>
          </a>
        </div>
      </div>

      {/* 3-Point Trust Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Card className="text-left bg-surface border-border hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-control bg-primary-soft text-primary flex items-center justify-center mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-text mb-2">Runs in your browser</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            All API calls travel directly from your browser to Telegram via secure WebSockets. No server, no database, no session logging anywhere.
          </p>
        </Card>

        <Card className="text-left bg-surface border-border hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-control bg-emerald-50 text-success flex items-center justify-center mb-4">
            <UserX className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-text mb-2">Never deletes for others</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Every removal operation enforces <code className="font-mono text-text bg-surface-muted px-1 py-0.5 rounded">revoke: false</code>. Unwanted chats disappear from your view while remaining intact for the other person.
          </p>
        </Card>

        <Card className="text-left bg-surface border-border hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-control bg-slate-100 text-text flex items-center justify-center mb-4">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-text mb-2">Zero Tracking or Ads</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            No analytics, no error tracking SDKs, no external cookies, and no third-party CDNs. What happens in your browser stays strictly in your browser.
          </p>
        </Card>
      </div>

      {/* Step-by-Step Credentials Guide */}
      <Card className="mb-16 text-left border-border bg-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
          <div>
            <h2 className="text-lg font-bold text-text">How to get your Telegram API credentials</h2>
            <p className="text-xs text-text-muted">
              Telegram provides official personal API keys to all users for custom client tools.
            </p>
          </div>
          <Badge variant="primary" className="self-start sm:self-auto">
            Takes ~60 seconds
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-surface-muted border border-border text-xs font-bold text-text flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text mb-1">Sign in to my.telegram.org</h4>
              <p className="text-xs text-text-muted leading-relaxed mb-2">
                Open Telegram&apos;s official developer portal and enter your international phone number.
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

          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-surface-muted border border-border text-xs font-bold text-text flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text mb-1">Create an API Application</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Click <strong>API development tools</strong>. Enter any title (e.g. <em>MyCleaner</em>) and short name, choose Web or Desktop platform, and submit.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-surface-muted border border-border text-xs font-bold text-text flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text mb-1">Copy App ID and App Hash</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Copy your numeric <strong>App api_id</strong> and 32-character hexadecimal <strong>App api_hash</strong> into the connection screen.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 rounded-control bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Radio className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <span>
            <strong>Note on login notices:</strong> Telegram will send you an official security alert: &quot;A new login occurred on Telegram Web&quot;. This is normal and confirms that this client connected directly to your account.
          </span>
        </div>
      </Card>

      {/* Collapsible / Detailed FAQ & Trust Section */}
      <div id="faq" className="text-left space-y-4">
        <h2 className="text-xl font-bold text-text">Frequently Asked Questions & Privacy Model</h2>

        <div className="space-y-3">
          <details className="group border border-border rounded-control bg-surface p-4 transition-colors open:bg-surface-muted/50">
            <summary className="font-semibold text-sm text-text cursor-pointer list-none flex items-center justify-between">
              <span>How is my session and login data handled?</span>
              <ChevronRight className="w-4 h-4 text-text-muted group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-3 text-xs text-text-muted leading-relaxed">
              By default, your credentials and session exist only in browser RAM during your active tab session. When you close or refresh the tab, all in-memory keys and sessions disappear. If you explicitly choose &quot;Remember me&quot;, your session is encrypted using AES-GCM via the Web Crypto API with a non-extractable key inside your browser&apos;s IndexedDB. No passwords or hashes are ever saved in localStorage or sent to any remote server.
            </p>
          </details>

          <details className="group border border-border rounded-control bg-surface p-4 transition-colors open:bg-surface-muted/50">
            <summary className="font-semibold text-sm text-text cursor-pointer list-none flex items-center justify-between">
              <span>Will the other person see that I deleted our chat?</span>
              <ChevronRight className="w-4 h-4 text-text-muted group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-3 text-xs text-text-muted leading-relaxed">
              No. Telegram offers two ways to delete chats: for yourself only, or for both parties. Telegram Chat Cleaner exclusively uses the user-only method (<code className="font-mono text-text">revoke: false</code>). The chat disappears from your dialog list and chat history, but the other participant&apos;s copy remains 100% untouched.
            </p>
          </details>

          <details className="group border border-border rounded-control bg-surface p-4 transition-colors open:bg-surface-muted/50">
            <summary className="font-semibold text-sm text-text cursor-pointer list-none flex items-center justify-between">
              <span>What happens if I remove a channel or group I own?</span>
              <ChevronRight className="w-4 h-4 text-text-muted group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-3 text-xs text-text-muted leading-relaxed">
              For groups and channels, removing a chat calls <code className="font-mono text-text">LeaveChannel</code> or <code className="font-mono text-text">DeleteChatUser</code>. Leaving does not delete the group or channel for its members or subscribers; they will continue to see and interact with it. The app flags owned chats with special warning badges in your review list.
            </p>
          </details>
        </div>

        <div className="pt-6 text-center">
          <Link href="/connect">
            <Button size="lg" className="font-semibold">
              Connect to Telegram
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
