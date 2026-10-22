import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { HttpsWarningBanner } from "@/components/layout/HttpsWarningBanner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F8FAFC",
};

export const metadata: Metadata = {
  title: "Telegram Chat Cleaner: Client-Side Bulk Chat Removal",
  description:
    "Securely bulk-remove conversations from your personal Telegram account only. Zero server, zero tracking, open source.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fontSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-bg text-text antialiased selection:bg-primary-soft selection:text-primary flex flex-col font-sans">
        <ToastProvider>
          <HttpsWarningBanner />
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
