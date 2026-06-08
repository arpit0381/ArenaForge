"use client";

import React, { useEffect, useState } from "react";
import Shell from "@/components/layout/Shell";
import { db } from "@/lib/db";
import { User } from "@/types/database.types";
import { Shield, User as UserIcon, Phone, MapPin, Tag, MessageSquare, Save, Bell, Sparkles, Check } from "lucide-react";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editUid, setEditUid] = useState("");
  const [editTg, setEditTg] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadProfile = () => {
    if (!db) return;
    const currentUser = db.getCurrentUser();
    setUser(currentUser);

    setEditName(currentUser.name || "");
    setEditPhone(currentUser.phone || "");
    setEditCity(currentUser.city || "");
    setEditUid(currentUser.game_uid || "");
    setEditTg(currentUser.telegram_username || "");
    
    // Extract avatar seed if possible
    if (currentUser.avatar_url?.includes("seed=")) {
      const match = currentUser.avatar_url.match(/seed=([^&]+)/);
      setAvatarSeed(match ? match[1] : currentUser.username);
    } else {
      setAvatarSeed(currentUser.username);
    }
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener("db-sync", loadProfile);
    return () => window.removeEventListener("db-sync", loadProfile);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!db) return;

    try {
      const updatedAvatarUrl = avatarSeed 
        ? `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(avatarSeed.trim())}`
        : user?.avatar_url || "";

      db.updateProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        city: editCity.trim(),
        game_uid: editUid.trim(),
        telegram_username: editTg.trim() || null,
        avatar_url: updatedAvatarUrl
      });

      setSuccessMsg("Fighter profile updated successfully in Supabase!");
      loadProfile();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = () => {
    if (!user || !user.telegram_id || !db) return;
    db.pushNotification(
      user.telegram_id,
      `🔔 TEST NOTIFICATION:\nHello ${user.name}! Your simulated bot credentials linking is fully operational.`
    );
    setSuccessMsg("Simulated notification dispatched to bot panel!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (!user) return null;

  return (
    <Shell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-surface to-background p-6 rounded-2xl border border-border shadow-md">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-display uppercase tracking-wide flex items-center gap-2">
              <UserIcon className="text-accent" size={24} />
              Fighter Card Settings
            </h1>
            <p className="text-xs text-text-secondary">
              Configure your game profile metadata, avatars, and linked Telegram chat commands.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-green-400 font-semibold animate-pulse">
            ✓ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel: Preview & Custom Swaps */}
          <div className="space-y-6">
            
            {/* Cyberpunk card preview */}
            <div className="bg-gradient-to-b from-surface to-background border border-border rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden group shadow-[0_0_30px_rgba(0,212,255,0.03)]">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-accent/10 to-transparent blur-xl" />
              
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-accent/40 bg-slate-900 flex items-center justify-center shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)] group-hover:scale-105 transition duration-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-4 space-y-1 w-full">
                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono tracking-widest border inline-block ${
                  user.role === "admin" 
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-accent/10 border-accent/20 text-accent"
                }`}>
                  {user.role === "admin" ? "Organizing Admin" : "Competitor / Player"}
                </span>
                <h3 className="font-display text-lg font-bold text-text-primary uppercase tracking-wide truncate mt-1">
                  {user.name}
                </h3>
                <p className="text-[11px] text-text-secondary font-mono">@{user.username}</p>
              </div>

              {/* Stat rows */}
              <div className="grid grid-cols-3 border-t border-border/60 w-full mt-6 pt-4 text-xs font-mono">
                <div className="flex flex-col items-center border-r border-border/40">
                  <span className="text-[9px] text-text-secondary uppercase">UID</span>
                  <span className="text-text-primary font-bold truncate max-w-[70px] mt-0.5">{user.game_uid || "TBD"}</span>
                </div>
                <div className="flex flex-col items-center border-r border-border/40">
                  <span className="text-[9px] text-text-secondary uppercase">City</span>
                  <span className="text-text-primary font-bold truncate max-w-[70px] mt-0.5">{user.city || "TBD"}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-text-secondary uppercase">TG Link</span>
                  <span className={`font-bold mt-0.5 ${user.telegram_id ? "text-green-400" : "text-red-400"}`}>
                    {user.telegram_id ? "Linked" : "No"}
                  </span>
                </div>
              </div>
            </div>

            {/* Theme Selector panel */}
            <ThemeSwitcher />

          </div>

          {/* Right Panel: Edit inputs Form */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-bold font-display text-text-primary uppercase tracking-wider border-b border-border/40 pb-2">
                Fighter registry details
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                      Display Name (IGN)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-secondary/60">
                        <UserIcon size={14} />
                      </span>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-accent text-text-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                      Avatar seed (Dicebear Pixel Art)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-secondary/60">
                        <Sparkles size={14} />
                      </span>
                      <input
                        type="text"
                        placeholder="Type any word to shuffle seed"
                        value={avatarSeed}
                        onChange={(e) => setAvatarSeed(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-accent text-text-primary font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-secondary/60">
                        <Phone size={14} />
                      </span>
                      <input
                        type="text"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-accent text-text-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                      City / Location
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-secondary/60">
                        <MapPin size={14} />
                      </span>
                      <input
                        type="text"
                        required
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-accent text-text-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                      Game UID (Character ID)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-secondary/60">
                        <Tag size={14} />
                      </span>
                      <input
                        type="text"
                        required
                        value={editUid}
                        onChange={(e) => setEditUid(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-accent text-text-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                      Telegram Username
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-secondary/60">
                        <MessageSquare size={14} />
                      </span>
                      <input
                        type="text"
                        placeholder="@username"
                        value={editTg}
                        onChange={(e) => setEditTg(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-accent text-text-primary"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent-hover text-black py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01] transition duration-200 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Commit Changes</span>
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* Telegram linking status */}
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-display text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="text-accent" size={16} />
                  Telegram Notifications Bot Link
                </h3>
                <span className={`w-2.5 h-2.5 rounded-full ${user.telegram_id ? "bg-green-400 shadow-[0_0_8px_#4ade80]" : "bg-red-400 shadow-[0_0_8px_#f87171]"}`} />
              </div>

              {user.telegram_id ? (
                <div className="space-y-3.5">
                  <div className="p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400 font-semibold flex items-center gap-2 font-mono">
                    <Check size={16} />
                    <span>Chat connection authenticated (Telegram ID: {user.telegram_id})</span>
                  </div>
                  <button
                    onClick={handleSendTestNotification}
                    className="bg-background border border-border hover:border-accent hover:text-accent px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bell size={14} />
                    <span>Send Test Announcement</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs leading-relaxed text-text-secondary">
                    You have not linked your Telegram chat credentials to the system logs. Link it now to receive match rooms, qualifier alerts, and winner announcements.
                  </p>
                  <div className="bg-background/80 border border-border p-3.5 rounded-xl text-xs font-mono leading-relaxed space-y-2">
                    <p className="text-[10px] text-accent uppercase font-bold tracking-wider">Instructions to link account:</p>
                    <p>1. Open the simulator bot in the floating widget bottom-right.</p>
                    <p>2. Send the command: <code className="bg-black/60 px-1.5 py-0.5 rounded text-accent">/start @username</code> (using your Telegram Username, e.g. <code className="text-accent">/start arpit0381</code>)</p>
                    <p>3. This will link your simulated user ID and refresh your profile settings page instantly.</p>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </Shell>
  );
}
