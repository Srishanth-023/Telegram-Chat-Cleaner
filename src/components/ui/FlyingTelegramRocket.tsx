"use client";

import React, { useState, useEffect, useCallback } from "react";
import clsx from "clsx";

/**
 * Official Telegram Logo Vector (50x50 viewBox)
 * Intrinsic orientation aligned so nose points along +X axis (0 degrees / right)
 */
function TelegramRocketLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={clsx("w-full h-full select-none", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Telegram Signature Radiant Cyan/Blue Gradient */}
        <linearGradient id="tgRocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2AABEE" />
          <stop offset="100%" stopColor="#229ED9" />
        </linearGradient>

        {/* Paper Plane Fold Shading */}
        <linearGradient id="tgWingShade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D2EAFB" />
          <stop offset="100%" stopColor="#B3DCF8" />
        </linearGradient>

        {/* Atmospheric Glow Filter */}
        <filter id="tgRocketGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#229ED9" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Telegram Outer Disc */}
      <circle cx="50" cy="50" r="46" fill="url(#tgRocketGrad)" filter="url(#tgRocketGlow)" />

      {/* Telegram Paper Airplane (Aligned horizontally pointing right) */}
      <g transform="rotate(-45 50 50) translate(0, 0)">
        {/* Main Upper Wing */}
        <path
          d="M 21 49 L 79 26 C 81.5 25 83.5 27.2 82.5 29.8 L 72.5 75.5 C 71.8 78.5 68.2 79.6 65.8 77.8 L 51 66 L 43.5 73.2 C 42 74.6 39.5 73.6 39.5 71.5 L 39.5 61 L 72 34.5 C 73 33.7 71.8 32.5 70.8 33.2 L 33 56.8 L 21 52.5 C 18.5 51.6 18.5 50 21 49 Z"
          fill="#FFFFFF"
        />

        {/* Crease / Under-Fold Shadow */}
        <path
          d="M 51 66 L 39.5 61 L 43.5 73.2 C 43.5 73.2 45 68 51 66 Z"
          fill="url(#tgWingShade)"
          opacity="0.85"
        />
      </g>
    </svg>
  );
}

export function FlyingTelegramRocket() {
  const [mounted, setMounted] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isBoosting, setIsBoosting] = useState(false);
  const [boostCount, setBoostCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("tg_rocket_enabled");
      if (saved !== null) {
        setIsEnabled(saved === "true");
      }
    } catch {
      // LocalStorage access restricted or unavailable
    }
  }, []);

  const toggleEnabled = () => {
    setIsEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("tg_rocket_enabled", String(next));
      } catch {
        // Ignore storage write error
      }
      return next;
    });
  };

  const triggerBoost = useCallback(() => {
    if (isBoosting) return;
    setIsBoosting(true);
    setBoostCount((c) => c + 1);
    setTimeout(() => {
      setIsBoosting(false);
    }, 1200);
  }, [isBoosting]);

  if (!mounted || !isEnabled) {
    if (!mounted) return null;

    // Small persistent re-enable pill in corner when turned off
    return (
      <div className="fixed bottom-3 right-3 z-30 pointer-events-auto">
        <button
          onClick={toggleEnabled}
          title="Enable Flying Telegram Rocket"
          aria-label="Enable Flying Telegram Rocket"
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-surface/90 hover:bg-surface border border-border/80 text-text-muted hover:text-primary rounded-full shadow-sm backdrop-blur-sm transition-all hover:scale-105"
        >
          <span>🚀</span>
          <span>Fly Rocket</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Main Hero Telegram Paper Rocket */}
      <div
        className={clsx(
          "absolute top-0 left-0 w-12 h-12 sm:w-14 sm:h-14 will-change-transform",
          "animate-fly-hero-rocket"
        )}
      >
        <div
          className={clsx(
            "relative w-full h-full cursor-pointer pointer-events-auto transition-transform duration-300 hover:scale-110 active:scale-95 group",
            isBoosting && "animate-rocket-barrel-roll"
          )}
          onClick={triggerBoost}
          title="Click the Telegram rocket for a supersonic boost! 🚀"
        >
          {/* Animated Rocket Jet Exhaust Stream */}
          <div className="absolute top-1/2 -left-10 sm:-left-12 -translate-y-1/2 w-12 sm:w-14 h-4 pointer-events-none flex items-center justify-end overflow-visible">
            {/* Plasma Flame Pulse */}
            <div className="w-full h-2.5 sm:h-3 rounded-full bg-gradient-to-l from-primary via-warning to-transparent animate-rocket-thrust-pulse origin-right" />
            
            {/* Exhaust Cloudlets / Vapor Puffs */}
            <div className="absolute right-8 w-2 h-2 rounded-full bg-primary/40 animate-exhaust-puff-1" />
            <div className="absolute right-12 w-2.5 h-2.5 rounded-full bg-primary/20 animate-exhaust-puff-2" />
          </div>

          {/* Telegram Logo Disc & Paper Plane */}
          <TelegramRocketLogo className="drop-shadow-md" />

          {/* Interactive Boost Particle Burst */}
          {isBoosting && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs font-black text-primary animate-ping">✨</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Secondary Mini Glider (Distant Altitude & Ambient Depth) */}
      <div className="absolute top-0 left-0 w-7 h-7 sm:w-8 sm:h-8 will-change-transform animate-fly-scout-plane opacity-70">
        <div className="relative w-full h-full pointer-events-none">
          {/* Subtle Contrail Stream */}
          <div className="absolute top-1/2 -left-6 -translate-y-1/2 w-7 h-1 rounded-full bg-gradient-to-l from-primary/50 to-transparent animate-pulse" />
          <TelegramRocketLogo />
        </div>
      </div>

      {/* 3. Subtle Quick Toggle Button (Floating in bottom-right corner) */}
      <div className="fixed bottom-3 right-3 z-30 pointer-events-auto opacity-40 hover:opacity-100 transition-opacity">
        <button
          onClick={toggleEnabled}
          title="Toggle Flying Telegram Rocket Animation"
          aria-label="Toggle Flying Telegram Rocket Animation"
          className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium bg-surface/80 hover:bg-surface border border-border/60 text-text-muted hover:text-text rounded-full shadow-sm backdrop-blur-sm transition-all"
        >
          <span>🚀</span>
          <span className="hidden sm:inline">Rocket ({boostCount > 0 ? `⚡${boostCount}` : "Active"})</span>
        </button>
      </div>
    </div>
  );
}
