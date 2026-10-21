import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "License: Telegram Chat Cleaner",
  description:
    "Open source MIT license and third-party notices for Telegram Chat Cleaner.",
};

export default function LicensePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-12 flex-1 w-full">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text mb-4 transition-colors font-medium"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5" />
          Back to cleaner
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
          Open Source License
        </h1>
        <p className="text-xs text-text-muted mt-2">
          Released under the standard MIT License.
        </p>
      </div>

      <div className="space-y-6 text-sm text-text-muted leading-relaxed">
        <section className="bg-surface border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-text mb-3">
            MIT License
          </h2>
          <div className="font-mono text-xs bg-bg border border-border rounded-card p-4 text-text space-y-4">
            <p>Copyright (c) 2026 Telegram Chat Cleaner Contributors</p>
            <p>
              Permission is hereby granted, free of charge, to any person obtaining a copy
              of this software and associated documentation files (the &quot;Software&quot;), to deal
              in the Software without restriction, including without limitation the rights
              to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
              copies of the Software, and to permit persons to whom the Software is
              furnished to do so, subject to the following conditions:
            </p>
            <p>
              The above copyright notice and this permission notice shall be included in all
              copies or substantial portions of the Software.
            </p>
            <p>
              THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
              AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
              LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
              OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
              SOFTWARE.
            </p>
          </div>
        </section>

        <section className="bg-surface border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-text mb-3">
            Telegram API and Trademark Notice
          </h2>
          <p className="mb-3">
            Telegram is a registered trademark of Telegram FZ-LLC. This software is an independent
            client-side utility and is not affiliated with, endorsed by, or sponsored by Telegram FZ-LLC.
          </p>
          <p>
            Usage of the Telegram API is governed by the Telegram Terms of Service and API Terms of Service.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-text mb-3">
            Third-Party Software Components
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li><strong>GramJS</strong>: Licensed under the MIT License. Copyright (c) Lonami Exo.</li>
            <li><strong>Next.js</strong>: Licensed under the MIT License. Copyright (c) Vercel, Inc.</li>
            <li><strong>React</strong>: Licensed under the MIT License. Copyright (c) Meta Platforms, Inc.</li>
            <li><strong>Tailwind CSS</strong>: Licensed under the MIT License. Copyright (c) Tailwind Labs, Inc.</li>
            <li><strong>Radix UI</strong>: Licensed under the MIT License. Copyright (c) WorkOS.</li>
            <li><strong>TanStack Virtual</strong>: Licensed under the MIT License. Copyright (c) Tanner Linsley.</li>
            <li><strong>Zustand</strong>: Licensed under the MIT License. Copyright (c) Paul Henschel.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
