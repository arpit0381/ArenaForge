"use client";

import React from "react";
import { useTheme, Theme } from "./ThemeProvider";

interface ThemeOption {
  id: Theme;
  name: string;
  bg: string;
  accent: string;
  vibe: string;
}

const themeOptions: ThemeOption[] = [
  { id: "cyber-dark", name: "Cyber Dark", bg: "#0A0A0F", accent: "#00D4FF", vibe: "Default Neon" },
  { id: "neon-night", name: "Neon Night", bg: "#050510", accent: "#FF0080", vibe: "Cyberpunk Pink" },
  { id: "forest-ops", name: "Forest Ops", bg: "#0D1A0D", accent: "#00FF88", vibe: "Tactical Green" },
  { id: "gold-elite", name: "Gold Elite", bg: "#0F0A00", accent: "#FFD700", vibe: "Premium Esports" },
  { id: "light-arena", name: "Light Arena", bg: "#F0F4FF", accent: "#4F46E5", vibe: "Clean Light" },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-3 p-4 bg-surface/80 backdrop-blur-md border border-border rounded-xl">
      <h3 className="text-sm font-semibold tracking-wider font-display uppercase text-text-primary">
        Arena Interface Style
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {themeOptions.map((opt) => {
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all duration-200 ${
                isActive
                  ? "border-accent bg-accent/10 shadow-[0_0_12px_rgba(var(--accent-rgb),0.15)] text-text-primary"
                  : "border-border bg-background/50 hover:bg-background/80 hover:border-text-secondary/30 text-text-secondary"
              }`}
            >
              {/* Color previews */}
              <div className="flex -space-x-1.5 items-center">
                <div
                  className="w-4 h-4 rounded-full border border-black/40"
                  style={{ backgroundColor: opt.bg }}
                />
                <div
                  className="w-4 h-4 rounded-full border border-black/40"
                  style={{ backgroundColor: opt.accent }}
                />
              </div>

              {/* Theme Names */}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold truncate leading-tight">
                  {opt.name}
                </span>
                <span className="text-[10px] opacity-60 truncate">
                  {opt.vibe}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
