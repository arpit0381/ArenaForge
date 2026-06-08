"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Trophy, 
  LayoutDashboard, 
  Users, 
  Settings, 
  ShieldAlert 
} from "lucide-react";

interface MobileNavProps {
  userRole: "player" | "admin";
}

export default function MobileNav({ userRole }: MobileNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-40 px-2 py-1 shadow-2xl flex items-center justify-around h-16">
      <Link
        href="/dashboard"
        className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${
          isActive("/dashboard") ? "text-accent" : "text-text-secondary hover:text-text-primary"
        }`}
      >
        <LayoutDashboard size={20} />
        <span className="text-[10px] mt-0.5 font-medium">HQ</span>
      </Link>

      <Link
        href="/tournaments"
        className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${
          isActive("/tournaments") ? "text-accent" : "text-text-secondary hover:text-text-primary"
        }`}
      >
        <Trophy size={20} />
        <span className="text-[10px] mt-0.5 font-medium">Tourneys</span>
      </Link>

      <Link
        href="/team"
        className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${
          isActive("/team") ? "text-accent" : "text-text-secondary hover:text-text-primary"
        }`}
      >
        <Users size={20} />
        <span className="text-[10px] mt-0.5 font-medium">Teams</span>
      </Link>

      <Link
        href="/profile"
        className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${
          isActive("/profile") ? "text-accent" : "text-text-secondary hover:text-text-primary"
        }`}
      >
        <Settings size={20} />
        <span className="text-[10px] mt-0.5 font-medium">Profile</span>
      </Link>

      {userRole === "admin" && (
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${
            isActive("/admin") ? "text-red-400" : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <ShieldAlert size={20} />
          <span className="text-[10px] mt-0.5 font-medium">Admin</span>
        </Link>
      )}
    </nav>
  );
}
