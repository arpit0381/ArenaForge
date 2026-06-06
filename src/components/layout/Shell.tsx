"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import TopBar from "./TopBar";
import TelegramSimulator from "./TelegramSimulator";
import { db } from "@/lib/db";

interface ShellProps {
  children: React.ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const [role, setRole] = useState<"player" | "admin">("player");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (db) {
      const user = db.getCurrentUser();
      setRole(user.role);
    }
    setMounted(true);
  }, []);

  const handleRoleToggle = () => {
    if (!db) return;
    const user = db.getCurrentUser();
    const newRole = user.role === "admin" ? "player" : "admin";
    const profiles = db.getProfiles();
    const match = profiles.find(p => p.role === newRole);
    if (match) {
      db.setCurrentUser(match.id);
      setRole(newRole);
      window.location.reload();
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen bg-[#0A0A0F] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span className="text-xs text-accent font-display tracking-widest uppercase animate-pulse">
            Booting Systems...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden text-text-primary">
      {/* Collapsible Sidebar for Desktop */}
      <Sidebar userRole={role} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopBar userRole={role} onRoleToggle={handleRoleToggle} />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <MobileNav userRole={role} />

      {/* Telegram Live Bot Feed Simulator */}
      <TelegramSimulator />
    </div>
  );
}
