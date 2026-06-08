"use client";

import React, { useEffect, useState } from "react";
import Shell from "@/components/layout/Shell";
import { db } from "@/lib/db";
import { Tournament, Game, TournamentRegistration } from "@/types/database.types";
import { Trophy, Search, Calendar, DollarSign, Users, Award, Play, CheckCircle2, Gamepad2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [selectedGameFilter, setSelectedGameFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "registration" | "ongoing" | "completed">("all");

  const loadData = () => {
    if (!db) return;
    setTournaments(db.getTournaments());
    setGames(db.getGames());
    setRegistrations(db.getRegistrations());
  };

  useEffect(() => {
    loadData();
    window.addEventListener("db-sync", loadData);
    return () => window.removeEventListener("db-sync", loadData);
  }, []);

  const getGameName = (gameId: string | null) => {
    if (!gameId) return "Unknown Game";
    const game = games.find(g => g.id === gameId);
    return game ? game.name : "Unknown Game";
  };

  const getRegisteredTeamsCount = (tourneyId: string) => {
    return registrations.filter(r => r.tournament_id === tourneyId && r.status === "approved").length;
  };

  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = selectedGameFilter === "all" || t.game_id === selectedGameFilter;
    const matchesTab = activeTab === "all" || t.status === activeTab;
    return matchesSearch && matchesGame && matchesTab;
  });

  return (
    <Shell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-surface to-background p-6 rounded-2xl border border-border shadow-md">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-display uppercase tracking-wide flex items-center gap-2">
              <Trophy className="text-accent animate-pulse" size={24} />
              Esports Arena Leagues
            </h1>
            <p className="text-xs text-text-secondary">
              Browse open tournaments, join active rosters, or review championship highlights.
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="bg-surface border border-border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
            <input
              type="text"
              placeholder="Search tournament name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          {/* Filters right side */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs text-text-secondary uppercase font-bold shrink-0 hidden sm:inline">Game:</span>
            <select
              value={selectedGameFilter}
              onChange={(e) => setSelectedGameFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent cursor-pointer flex-1 sm:flex-initial"
            >
              <option value="all">All Games</option>
              {games.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 border-b border-border/60 pb-1">
          {[
            { id: "all", label: "All Tournaments" },
            { id: "registration", label: "Registration Open" },
            { id: "ongoing", label: "Ongoing / Live" },
            { id: "completed", label: "Past / Completed" },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 border-b-2 text-xs font-bold uppercase tracking-wider transition ${
                  active
                    ? "border-accent text-accent"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tournaments Grid */}
        {filteredTournaments.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-secondary">
            <Trophy size={36} className="mx-auto opacity-20 mb-2" />
            <h3 className="font-display font-bold text-text-primary uppercase tracking-wider text-sm">No leagues found</h3>
            <p className="text-xs mt-1">Try adjusting your search criteria or choosing a different game filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((t) => {
              const registeredTeams = getRegisteredTeamsCount(t.id);
              return (
                <div
                  key={t.id}
                  className="bg-surface border border-border hover:border-accent/30 rounded-2xl p-5 flex flex-col justify-between hover:scale-[1.01] transition duration-200 shadow-[0_0_20px_rgba(0,0,0,0.15)] relative overflow-hidden group"
                >
                  {t.status === "ongoing" && (
                    <div className="absolute top-3 right-3 bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono tracking-wider animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      LIVE
                    </div>
                  )}
                  {t.status === "completed" && (
                    <div className="absolute top-3 right-3 bg-slate-500/10 border border-slate-500/20 text-slate-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono tracking-wider">
                      COMPLETED
                    </div>
                  )}
                  {t.status === "registration" && (
                    <div className="absolute top-3 right-3 bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono tracking-wider">
                      OPEN
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Gamepad2 size={16} className="text-accent" />
                      <span className="text-[10px] text-accent font-mono uppercase font-bold">
                        {getGameName(t.game_id)}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-text-primary uppercase tracking-wide truncate group-hover:text-accent transition-colors">
                      {t.name}
                    </h3>

                    {/* Stats rows */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                      <div className="p-2 bg-background/40 border border-border/60 rounded-xl flex flex-col">
                        <span className="text-[9px] text-text-secondary uppercase">Prize Pool</span>
                        <span className="font-mono font-bold text-accent">₹{t.prize_pool.toLocaleString()}</span>
                      </div>
                      <div className="p-2 bg-background/40 border border-border/60 rounded-xl flex flex-col">
                        <span className="text-[9px] text-text-secondary uppercase">Entry Fee</span>
                        <span className="font-mono font-bold text-text-primary">
                          {t.entry_fee === 0 ? "FREE" : `₹${t.entry_fee}`}
                        </span>
                      </div>
                    </div>

                    {/* Participant counts */}
                    <div className="flex justify-between items-center text-[10px] text-text-secondary pt-2">
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        <span>Registered Lobbies:</span>
                      </span>
                      <span className="font-mono font-bold text-text-primary">
                        {registeredTeams} / {t.max_teams} Teams
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-background rounded-full h-1.5 border border-border">
                      <div
                        className="bg-accent h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (registeredTeams / t.max_teams) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="border-t border-border/60 pt-4 mt-4">
                    <Link
                      href={`/tournament/${t.id}`}
                      className="w-full bg-background border border-border hover:border-accent hover:text-accent py-2 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-2"
                    >
                      <span>Enter Arena Detail</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </Shell>
  );
}
