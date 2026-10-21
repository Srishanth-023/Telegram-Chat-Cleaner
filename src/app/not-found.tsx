import React from "react";
import Link from "next/link";
import { Home } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <main className="flex-1 max-w-md mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
      <Card className="p-8 border-border bg-surface">
        <span className="text-4xl font-extrabold text-primary block mb-2 font-mono">404</span>
        <h1 className="text-lg font-bold tracking-tight text-text mb-2">Page Not Found</h1>
        <p className="text-xs text-text-muted mb-6 leading-relaxed">
          The requested page does not exist or has been moved.
        </p>

        <Link href="/">
          <Button size="md" className="font-medium">
            <Home className="w-4 h-4 mr-1.5" />
            Back to Home
          </Button>
        </Link>
      </Card>
    </main>
  );
}
