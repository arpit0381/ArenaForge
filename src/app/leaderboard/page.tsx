"use client";

import React, { useEffect, useState } from "react";
import Shell from "@/components/layout/Shell";
import { db } from "@/lib/db";
import { Tournament, Team, TournamentStanding } from "@/types/database.types";
import { Trophy, Search, ListOrdered, Calendar, Star, Sparkles } from "lucide-react";

export default function DedicatedLeaderboardPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTourneyId, setSelectedTourneyId] = useState("");
  const [standings, setStandings] = useState<TournamentStanding[]>([]);

  const loadAll = () => {
    if (!db) return;
    const allTourneys = db.getTournaments().filter(t => t.status === "ongoing" || t.status === "completed");
    setTournaments(allTourneys);
    setTeams(db.getTeams());
    
    if (allTourneys.length > 0) {
      setSelectedTourneyId(prev => prev || allTourneys[0].id);
    }
  };

  useEffect(() => {
    loadAll();
    window.addEventListener("db-sync", loadAll);
    return () => window.removeEventListener("db-sync", loadAll);
  }, []);

  useEffect(() => {
    if (!selectedTourneyId || !db) return;
    setStandings(db.getStandings(selectedTourneyId));
  }, [selectedTourneyId]);

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || "Unknown Team";
  };

  const getTeamLogo = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.logo_url || "";
  };

  const activeTourney = tournaments.find(t => t.id === selectedTourneyId);

  return (
    <Shell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display uppercase tracking-wide">
              Global Leaderboards
            </h1>
            <p className="text-xs text-text-secondary">
              Real-time standings and scores across all active and historically completed tournament lobbies.
            </p>
          </div>
        </div>

        {/* Select tournament */}
        <div className="bg-surface border border-border p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase">
            <Trophy size={16} className="text-accent" />
            <span>Select Active League:</span>
          </div>

          {tournaments.length === 0 ? (
            <p className="text-xs text-text-secondary italic">No active or completed leagues found.</p>
          ) : (
            <select
              value={selectedTourneyId}
              onChange={(e) => setSelectedTourneyId(e.target.value)}
              className="bg-background border border-border rounded-lg px-4 py-2 text-xs text-text-primary focus:outline-none focus:border-accent cursor-pointer w-full sm:w-80"
            >
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.status.toUpperCase()})</option>
              ))}
            </select>
          )}
        </div>

        {/* Leaderboard Table */}
        {selectedTourneyId && (
          <div className="bg-surface border border-border rounded-2xl p-5 overflow-hidden">
            <div className="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border/40 pb-4">
              <div>
                <h3 className="text-base font-bold font-display text-text-primary uppercase tracking-wide">
                  {activeTourney?.name} Standings
                </h3>
                <p className="text-[10px] text-text-secondary">
                  Calculated automatically based on match result entries.
                </p>
              </div>

              {activeTourney?.status === "completed" && (
                <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Star size={12} className="animate-spin duration-3000" /> Champions Declared
                </span>
              )}
            </div>

            {standings.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-secondary">
                No standings computed for this league yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border text-text-secondary uppercase tracking-wider text-[10px] font-bold">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Squad Name</th>
                      <th className="py-3 px-4 text-center">Matches</th>
                      <th className="py-3 px-4 text-center">Kills</th>
                      <th className="py-3 px-4 text-center">Total Points</th>
                      <th className="py-3 px-4 text-right">League Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-mono">
                    {standings.map((st) => (
                      <tr
                        key={st.id}
                        className={`hover:bg-background/20 transition ${
                          st.qualification_status === "qualified" ? "bg-green-500/5" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-text-primary">
                          #{st.current_rank}
                        </td>
                        <td className="py-3.5 px-4 font-sans font-bold flex items-center gap-2">
                          <div className="w-6 h-6 rounded overflow-hidden flex items-center justify-center p-0.5 bg-background border border-border shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={getTeamLogo(st.team_id)} alt="" className="w-full h-full" />
                          </div>
                          <span className="truncate">{getTeamName(st.team_id)}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-text-primary">
                          {st.total_matches}
                        </td>
                        <td className="py-3.5 px-4 text-center text-text-secondary">
                          {st.total_kills}
                        </td>
                        <td className="py-3.5 px-4 text-center text-accent font-extrabold text-sm">
                          {st.total_points}
                        </td>
                        <td className="py-3.5 px-4 text-right font-sans">
                          {st.qualification_status === "qualified" ? (
                            <span className="bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">
                              Qualified ✓
                            </span>
                          ) : st.qualification_status === "eliminated" ? (
                            <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                              Eliminated
                            </span>
                          ) : (
                            <span className="bg-slate-500/10 border border-slate-500/20 text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                              Active Run
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </Shell>
  );
}
