import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Terms of Service: Telegram Chat Cleaner",
  description:
    "Terms of service, operation boundaries, and non-revocation policies for Telegram Chat Cleaner.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-xs text-text-muted mt-2">
          Effective date: October 2026. Static client-side software.
        </p>
      </div>

      <div className="space-y-6 text-sm text-text-muted leading-relaxed">
        <section className="bg-surface border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-text mb-3">
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

        <section className="bg-surface border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-text mb-3">
            2. The Non-Revocation Guarantee
          </h2>
          <p className="mb-3">
            All deletion and departure routines executed by this software are strictly scoped to the
            authenticated user&apos;s view:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              When deleting direct messages or group histories, the API parameter <code>revoke</code> is hardcoded to <code>false</code>.
              Messages are purged exclusively from the user&apos;s dialogue box and remain intact for other participants.
            </li>
            <li>
              When departing supergroups or channels, the user leaves the entity without revoking message histories for other members.
            </li>
          </ul>
        </section>

        <section className="bg-surface border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-text mb-3">
            3. User Responsibilities and API Credentials
          </h2>
          <p className="mb-3">
            Users must supply their own Telegram API credentials (API ID and API Hash) obtained from my.telegram.org.
            You agree to use this application strictly in compliance with Telegram&apos;s Terms of Service and API policies:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>You agree not to use this software for automated spam or abusive activity.</li>
            <li>You acknowledge that aggressive flood limits or repeated deletions can result in temporary Telegram FLOOD_WAIT cooldowns.</li>
            <li>You remain solely responsible for maintaining the confidentiality of your session passphrases and verification codes.</li>
          </ul>
        </section>

        <section className="bg-surface border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-text mb-3">
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

        <section className="bg-surface border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-text mb-3">
            5. Independence from Telegram FZ-LLC
          </h2>
          <p>
            Telegram Chat Cleaner is an independent open-source project and is not affiliated, associated, authorized,
            endorsed by, or in any way officially connected with Telegram FZ-LLC or any of its subsidiaries or affiliates.
          </p>
        </section>
      </div>
    </main>
  );
}
