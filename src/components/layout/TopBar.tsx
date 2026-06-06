"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { Profile } from "@/types/database.types";
import { User, Shield, RefreshCw } from "lucide-react";

interface TopBarProps {
  userRole: "player" | "admin";
  onRoleToggle: () => void;
}

export default function TopBar({ userRole, onRoleToggle }: TopBarProps) {
  const [user, setUser] = useState<Profile | null>(null);

  useEffect(() => {
    if (db) {
      setUser(db.getCurrentUser());
    }
  }, [userRole]);

  return (
    <header className="h-16 border-b border-border bg-surface/40 backdrop-blur-md flex items-center justify-between px-6 z-30 shrink-0 sticky top-0">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold tracking-wider font-display uppercase text-text-primary">
          System Control
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Switcher Button */}
        <button
          onClick={onRoleToggle}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition ${
            userRole === "admin"
              ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
              : "bg-accent/10 border-accent/30 text-accent hover:bg-accent/20"
          }`}
        >
          {userRole === "admin" ? (
            <>
              <Shield size={14} />
              <span>Admin Deck</span>
            </>
          ) : (
            <>
              <User size={14} />
              <span>Player HQ</span>
            </>
          )}
          <RefreshCw size={10} className="opacity-60 ml-1 animate-spin duration-1000" />
        </button>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-2.5 border-l border-border pl-4">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-background flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar_url || "https://api.dicebear.com/7.x/pixel-art/svg?seed=user"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold leading-none text-text-primary">
                {user.display_name}
              </span>
              <span className="text-[9px] text-text-secondary leading-none mt-1">
                @{user.username}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
