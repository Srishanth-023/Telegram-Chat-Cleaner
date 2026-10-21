import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon, ShieldCheck, UserX, AlertTriangle, Lock } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Terms of Service: Telegram Chat Cleaner",
  description:
    "Terms of service, operation boundaries, and non-revocation policies for Telegram Chat Cleaner.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-xs text-text-muted mt-2">
          Effective date: October 2026. Static client-side software governed by the MIT License.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Quick Navigation & Terms Overview */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4 text-left">
          <div className="p-5 rounded-card bg-surface border border-border space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text block">
              Terms Sections
            </span>
            <nav className="space-y-2 text-xs font-medium">
              <a href="#nature" className="block text-text-muted hover:text-primary transition-colors">
                1. Nature of Application
              </a>
              <a href="#non-revocation" className="block text-text-muted hover:text-primary transition-colors">
                2. Non-Revocation Guarantee
              </a>
              <a href="#user-responsibilities" className="block text-text-muted hover:text-primary transition-colors">
                3. User Responsibilities
              </a>
              <a href="#warranties" className="block text-text-muted hover:text-primary transition-colors">
                4. Disclaimer of Warranties
              </a>
              <a href="#trademark" className="block text-text-muted hover:text-primary transition-colors">
                5. Trademark Independence
              </a>
            </nav>
          </div>

          <div className="p-5 rounded-card bg-surface border border-border space-y-3 text-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-text block">
              Core Commitments
            </span>
            <div className="space-y-2 text-text-muted">
              <div className="flex justify-between py-1 border-b border-border">
                <span>Revocation Policy</span>
                <strong className="text-text font-mono text-[11px]">Strictly revoke: false</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span>Account Impact</span>
                <strong className="text-text font-mono text-[11px]">Own account only</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span>Confirmation Gate</span>
                <strong className="text-text font-mono text-[11px]">2-Step Required</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>License</span>
                <strong className="text-text font-mono text-[11px]">MIT Open Source</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: In-depth Terms Content */}
        <div className="lg:col-span-8 space-y-6 text-sm text-text-muted leading-relaxed text-left">
          <section id="nature" className="bg-surface border border-border rounded-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              1. Nature of the Application
            </h2>
            <p className="mb-3">
              Telegram Chat Cleaner is an open-source, client-side utility built with Next.js and GramJS.
              The software executes entirely within the user&apos;s web browser. It does not employ a central
              server, database, proxy, analytics service, or third-party tracking network.
            </p>
            <p>
              Network connections initiated by this application connect directly from the user&apos;s device
              to Telegram&apos;s MTProto gateway over secure WebSockets.
            </p>
          </section>

          <section id="non-revocation" className="bg-surface border border-border rounded-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
              <UserX className="w-5 h-5 text-primary" />
              2. The Non-Revocation Guarantee
            </h2>
            <p className="mb-3">
              All deletion and departure routines executed by this software are strictly scoped to the
              authenticated user&apos;s personal view:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li>
                When deleting direct messages or group histories, the API parameter <code>revoke</code> is hardcoded to <code>false</code>.
                Messages are purged exclusively from your dialogue box and remain intact for other participants.
              </li>
              <li>
                When departing supergroups or channels, you leave the entity without revoking message histories for other members.
              </li>
            </ul>
          </section>

          <section id="user-responsibilities" className="bg-surface border border-border rounded-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              3. User Responsibilities and API Credentials
            </h2>
            <p className="mb-3">
              Users must supply their own Telegram API credentials (API ID and API Hash) obtained from my.telegram.org.
              You agree to use this application strictly in compliance with Telegram&apos;s Terms of Service and API policies:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li>You agree not to use this software for automated spam or abusive activity.</li>
              <li>You acknowledge that rapid or repeated deletions can result in temporary Telegram <code>FLOOD_WAIT</code> cooldowns.</li>
              <li>You remain solely responsible for maintaining the confidentiality of your session passphrases and verification codes.</li>
            </ul>
          </section>

          <section id="warranties" className="bg-surface border border-border rounded-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              4. Disclaimer of Warranties
            </h2>
            <p className="mb-3">
              The software is provided &quot;as is&quot;, without warranty of any kind, express or implied, including
              but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement.
            </p>
            <p>
              In no event shall the authors or copyright holders be liable for any claim, damages, or other liability,
              whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the
              software or the use or other dealings in the software.
            </p>
          </section>

          <section id="trademark" className="bg-surface border border-border rounded-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              5. Independence from Telegram FZ-LLC
            </h2>
            <p>
              Telegram Chat Cleaner is an independent open-source project and is not affiliated, associated, authorized,
              endorsed by, or in any way officially connected with Telegram FZ-LLC or any of its subsidiaries or affiliates.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
