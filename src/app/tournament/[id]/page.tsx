"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Shell from "@/components/layout/Shell";
import { db } from "@/lib/db";
import { Tournament, Team, TournamentRegistration, MatchRoom, RoomAssignment, TournamentStanding, User, Game } from "@/types/database.types";
import { 
  Trophy, 
  Calendar, 
  DollarSign, 
  Award, 
  BookOpen, 
  Users, 
  Layers, 
  ListOrdered, 
  History, 
  UserCheck,
  Star,
  Zap
} from "lucide-react";
import RegistrationFlow from "@/components/tournament/RegistrationFlow";

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [rooms, setRooms] = useState<MatchRoom[]>([]);
  const [standings, setStandings] = useState<TournamentStanding[]>([]);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "teams" | "groups" | "leaderboard" | "bracket" | "results" | "winners">("overview");
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);

  const loadAllData = () => {
    if (!db) return;
    const tourney = db.getTournamentById(id);
    if (!tourney) {
      router.push("/tournaments");
      return;
    }
    setTournament(tourney);
    setTeams(db.getTeams());
    setGames(db.getGames());
    setRegistrations(db.getRegistrationsForTournament(id));
    setRooms(db.getRoomsForTournament(id));
    setStandings(db.getStandings(id));
    setProfiles(db.getProfiles());
  };

  useEffect(() => {
    loadAllData();
    window.addEventListener("db-sync", loadAllData);
    return () => window.removeEventListener("db-sync", loadAllData);
  }, [id]);

  if (!tournament) return null;

  const approvedRegistrations = registrations.filter(r => r.status === "approved");
  const isRegistered = registrations.some(r => r.status === "approved" || r.status === "pending");

  const getTeamName = (teamId: string | null) => {
    if (!teamId) return "No Winner Declared";
    return teams.find(t => t.id === teamId)?.name || "Unknown Team";
  };

  const getTeamLogo = (teamId: string | null) => {
    if (!teamId) return "";
    return teams.find(t => t.id === teamId)?.logo_url || "";
  };

  const getTeamTag = (teamId: string | null) => {
    if (!teamId) return "";
    return teams.find(t => t.id === teamId)?.tag || "";
  };

  const getPlayerName = (playerId: string | null) => {
    if (!playerId) return "No Player Named";
    return profiles.find(p => p.id === playerId)?.name || "Anonymous Gamer";
  };

  const getPlayerUID = (playerId: string | null) => {
    if (!playerId) return "";
    return profiles.find(p => p.id === playerId)?.game_uid || "";
  };

  return (
    <Shell>
      <div className="space-y-6">
        
        {/* Hero Banner */}
        <div className="relative h-60 w-full rounded-2xl overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-accent/20 border border-accent/40 rounded text-[10px] font-bold text-accent uppercase tracking-wider">
                  Arena League
                </span>
                <span className="text-xs text-text-secondary font-mono">
                  Lobby Details
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-display uppercase tracking-wide text-text-primary">
                {tournament.name}
              </h1>
            </div>

            {tournament.status === "registration" && (
              <div className="shrink-0">
                {isRegistered ? (
                  <div className="px-5 py-2.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                    <UserCheck size={16} />
                    <span>Roster Registered ✓</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsRegModalOpen(true)}
                    className="bg-accent hover:bg-accent-hover text-black px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,212,255,0.25)] hover:scale-[1.02] transition cursor-pointer"
                  >
                    Register Team
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        {(() => {
          const game = games.find(g => g.id === tournament.game_id);
          const isBracket = game?.qualification === "bracket";
          const tabsList = [
            { id: "overview", label: "Overview", icon: BookOpen },
            { id: "teams", label: `Teams (${approvedRegistrations.length}/${tournament.max_teams})`, icon: Users },
            { id: "groups", label: "Groups / Rooms", icon: Layers },
            ...(isBracket 
              ? [{ id: "bracket", label: "Bracket Flow", icon: Trophy }] 
              : [{ id: "leaderboard", label: "Live Standings", icon: ListOrdered }]
            ),
            { id: "results", label: "Match Records", icon: History },
            { id: "winners", label: "Winners Podium", icon: Award },
          ];
          return (
            <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 pb-1.5">
              {tabsList.map((tab) => {
                const ActiveIcon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-bold uppercase tracking-wider transition ${
                      active
                        ? "border-accent text-accent"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <ActiveIcon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold font-display text-text-primary uppercase tracking-wide border-b border-border/40 pb-2 flex items-center gap-1.5">
                  <Award size={18} className="text-accent" /> Arena Regulations & Info
                </h3>
                <p className="text-xs text-text-secondary whitespace-pre-line leading-relaxed">
                  {tournament.rules || "Standard regulations apply to this tournament matches."}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-display text-text-primary uppercase tracking-widest">
                  Key Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs p-2 bg-background/40 border border-border rounded-lg">
                    <span className="text-text-secondary">Prize Pool:</span>
                    <span className="font-mono font-bold text-accent">₹{tournament.prize_pool.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs p-2 bg-background/40 border border-border rounded-lg">
                    <span className="text-text-secondary">Entry Fee:</span>
                    <span className="font-mono font-bold text-text-primary">
                      {tournament.entry_fee === 0 ? "FREE" : `₹${tournament.entry_fee}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs p-2 bg-background/40 border border-border rounded-lg">
                    <span className="text-text-secondary">Max Capacity:</span>
                    <span className="font-mono font-bold text-text-primary">{tournament.max_teams} Teams</span>
                  </div>
                  <div className="flex justify-between items-center text-xs p-2 bg-background/40 border border-border rounded-lg">
                    <span className="text-text-secondary">Qualifier Threshold:</span>
                    <span className="font-mono font-bold text-accent">Top {tournament.qualifier_spots} Advance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TEAMS TAB */}
        {activeTab === "teams" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {approvedRegistrations.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-text-secondary">
                No approved teams listed yet. Approve registrations in Admin Panel.
              </div>
            ) : (
              approvedRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 hover:border-accent/20 transition"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-border flex items-center justify-center p-1 bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getTeamLogo(reg.team_id)} alt="" className="w-full h-full" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-text-primary truncate">
                      {getTeamName(reg.team_id)}
                    </span>
                    <span className="text-[10px] text-text-secondary uppercase">
                      TAG: {getTeamTag(reg.team_id)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* GROUPS / ROOMS TAB */}
        {activeTab === "groups" && (
          <div className="space-y-6">
            {rooms.length === 0 ? (
              <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-secondary">
                <Layers size={36} className="mx-auto opacity-30 mb-2 animate-bounce" />
                <h3 className="font-display font-semibold text-text-primary uppercase tracking-wider text-sm">
                  Draw Conduct Not Complete
                </h3>
                <p className="text-xs mt-1 max-w-sm mx-auto">
                  Rooms and group assignments are generated by the admin after the registrations window shuts down.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rooms.map((room) => {
                  if (!db) return null;
                  const assignments = db.getRoomAssignments(room.id);
                  return (
                    <div
                      key={room.id}
                      className="bg-surface border border-border rounded-2xl p-5 space-y-4 hover:border-accent/25 transition animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <div>
                          <h4 className="font-display font-bold text-text-primary uppercase tracking-wider">
                            {room.room_label}
                          </h4>
                          <span className="text-[9px] bg-accent/10 border border-accent/20 text-accent px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">
                            {room.round_type === "grand_final" ? "Finals Round" : "Qualifiers"}
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          room.status === "completed" ? "bg-slate-500/10 text-slate-400" : "bg-green-500/10 text-green-400"
                        }`}>
                          {room.status === "completed" ? "Completed" : "Scheduled"}
                        </span>
                      </div>

                      {/* Display in-game room ID credentials */}
                      <div className="p-3 bg-background/50 border border-border rounded-xl flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[9px] text-text-secondary uppercase tracking-widest font-bold">Room ID</span>
                          <span className="font-mono text-xs text-text-primary block mt-0.5 select-all">
                            {room.room_id_code || "LOCK (Shared T-15m)"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-text-secondary uppercase tracking-widest font-bold">Password</span>
                          <span className="font-mono text-xs text-text-primary block mt-0.5 select-all">
                            {room.room_password || "LOCK (Shared T-15m)"}
                          </span>
                        </div>
                      </div>

                      {/* Assigned Teams list */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-text-secondary uppercase font-bold tracking-widest">Seeded Teams</span>
                        <div className="grid grid-cols-2 gap-2">
                          {assignments.map((assign) => (
                            <div
                              key={assign.id}
                              className="flex items-center gap-2 p-2 bg-background/25 border border-border/60 rounded-lg"
                            >
                              <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center p-0.5 bg-surface border border-border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={getTeamLogo(assign.team_id)} alt="" className="w-full h-full" />
                              </div>
                              <span className="text-xs text-text-primary font-medium truncate">
                                {getTeamName(assign.team_id)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* LIVE STANDINGS TAB */}
        {activeTab === "leaderboard" && (
          <div className="bg-surface border border-border rounded-2xl p-5 overflow-hidden">
            <div className="mb-4">
              <h3 className="text-sm font-bold font-display text-text-primary uppercase tracking-wider">
                Overall Standings Leaderboard
              </h3>
            </div>

            {standings.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-secondary">
                No standings computed yet. Enter match scores in Admin Deck to view live rankings.
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

        {/* BRACKET TAB */}
        {activeTab === "bracket" && (() => {
          const round1Rooms = rooms.filter(r => r.round_number === 1);
          const round2Rooms = rooms.filter(r => r.round_type === "grand_final" || r.round_number === 2);

          const getRoomTeamsAndScores = (roomId: string) => {
            if (!db) return [];
            const assigns = db.getRoomAssignments(roomId);
            const roomResults = db.getResultsForRoom(roomId);
            return assigns.map(a => {
              const team = teams.find(t => t.id === a.team_id);
              const result = roomResults.find(res => res.team_id === a.team_id);
              return {
                name: team?.name || "Pending Selection",
                tag: team?.tag || "",
                score: result ? result.placement_points + result.kill_points : null,
                isWinner: result ? result.position === 1 : false
              };
            });
          };

          const hasMatches = round1Rooms.length > 0 || round2Rooms.length > 0;

          return (
            <div className="bg-surface border border-border rounded-2xl p-6 overflow-hidden">
              <div className="mb-6">
                <h3 className="text-sm font-bold font-display text-text-primary uppercase tracking-wider">
                  Bracket Playoff Flowchart
                </h3>
              </div>

              {!hasMatches ? (
                <div className="py-12 text-center text-xs text-text-secondary">
                  <Trophy size={36} className="mx-auto opacity-30 mb-2 animate-bounce" />
                  <h3 className="font-display font-semibold text-text-primary uppercase tracking-wider text-sm">
                    Bracket Draw Not Complete
                  </h3>
                  <p className="text-xs mt-1 max-w-sm mx-auto">
                    Bracket rooms and assignments will generate after team registrations are closed.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center justify-around gap-8 md:gap-4 min-h-[300px] relative overflow-x-auto py-4">
                  {/* Round 1: Semifinals */}
                  <div className="flex flex-col gap-12 w-64 z-10 shrink-0">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest text-center border-b border-border pb-1">
                      Semifinals (BO3)
                    </span>
                    
                    {round1Rooms.map((room) => {
                      const roomTeams = getRoomTeamsAndScores(room.id);
                      while (roomTeams.length < 2) {
                        roomTeams.push({ name: "TBD", tag: "", score: null, isWinner: false });
                      }
                      return (
                        <div key={room.id} className="bg-background/80 border border-border rounded-xl p-3 space-y-2.5">
                          <div className="text-[9px] text-accent uppercase font-bold">{room.room_label}</div>
                          {roomTeams.map((rt, idx) => (
                            <div key={idx} className={`flex justify-between items-center text-xs ${rt.isWinner ? "font-bold text-text-primary" : "opacity-55 font-medium"}`}>
                              <span className="truncate">{rt.name} {rt.tag ? `(${rt.tag})` : ""}</span>
                              <span className="font-mono text-accent font-bold">
                                {rt.score !== null ? rt.score : "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>

                  {/* Connector lines visual */}
                  <div className="hidden md:block absolute top-1/2 left-[38%] right-[38%] h-0.5 bg-border -translate-y-1/2 z-0" />

                  {/* Round 2: Grand Finals */}
                  <div className="flex flex-col gap-12 w-64 z-10 shrink-0">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest text-center border-b border-accent pb-1">
                      Grand Finals (BO5)
                    </span>

                    {round2Rooms.length === 0 ? (
                      <div className="text-center text-xs text-text-secondary py-6 italic">
                        Waiting for Semifinal winners...
                      </div>
                    ) : (
                      round2Rooms.map((room) => {
                        const roomTeams = getRoomTeamsAndScores(room.id);
                        while (roomTeams.length < 2) {
                          roomTeams.push({ name: "TBD", tag: "", score: null, isWinner: false });
                        }
                        return (
                          <div key={room.id} className="bg-background/80 border border-accent/40 rounded-xl p-4.5 space-y-3 shadow-[0_0_15px_rgba(0,212,255,0.1)]">
                            <div className="text-[9px] text-accent uppercase font-bold">{room.room_label}</div>
                            {roomTeams.map((rt, idx) => (
                              <div key={idx} className={`flex justify-between items-center text-xs ${rt.isWinner ? "font-bold text-text-primary" : "opacity-60"}`}>
                                <span className="truncate">{rt.name} {rt.tag ? `(${rt.tag})` : ""}</span>
                                <span className="font-mono text-accent font-bold">
                                  {rt.score !== null ? rt.score : "-"}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* RESULTS TAB */}
        {activeTab === "results" && (
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="mb-4">
              <h3 className="text-sm font-bold font-display text-text-primary uppercase tracking-wider">
                Historic Match Records
              </h3>
            </div>

            {rooms.filter(r => r.status === "completed").length === 0 ? (
              <div className="py-12 text-center text-xs text-text-secondary">
                No historic matches recorded yet. Submit results in Admin Dashboard to populate details.
              </div>
            ) : (
              <div className="space-y-6">
                {rooms.filter(r => r.status === "completed").map((room) => {
                  if (!db) return null;
                  const roomResults = db.getResultsForRoom(room.id).sort((a,b) => a.position - b.position);
                  return (
                    <div key={room.id} className="border border-border/80 rounded-xl overflow-hidden">
                      <div className="p-3 bg-background border-b border-border flex justify-between items-center">
                        <span className="font-display font-bold text-text-primary uppercase text-xs">
                          {room.room_label} Details
                        </span>
                        <span className="text-[9px] text-text-secondary font-mono">
                          Completed {new Date(room.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        {roomResults.map((res) => (
                          <div
                            key={res.id}
                            className="flex items-center justify-between text-xs p-2 bg-surface/30 border border-border/40 rounded-lg font-mono"
                          >
                            <div className="flex items-center gap-3 font-sans font-bold">
                              <span className="text-accent">#{res.position}</span>
                              <span>{getTeamName(res.team_id)}</span>
                            </div>
                            <div className="flex items-center gap-6">
                              <span>Kills: <strong className="text-text-primary">{res.kills}</strong></span>
                              <span>Points: <strong className="text-accent">{res.total_points}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* WINNERS TAB */}
        {activeTab === "winners" && (
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-6 overflow-hidden">
            <div className="mb-2">
              <h3 className="text-sm font-bold font-display text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Star className="text-yellow-400" /> Tournament Winners Podium
              </h3>
              <p className="text-[10px] text-text-secondary">
                Official winners computed and announced after the Grand Finals matching formats.
              </p>
            </div>

            {tournament.status !== "completed" ? (
              <div className="py-12 text-center text-xs text-text-secondary bg-background/30 border border-dashed border-border rounded-2xl">
                🏆 Arena in Progress. Winners podium will unlock once tournament matches complete.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                
                {/* 1st Place: Champion */}
                <div className="bg-gradient-to-b from-yellow-500/10 to-transparent border-2 border-yellow-500/40 rounded-2xl p-6 text-center space-y-4 flex flex-col items-center justify-between relative shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                  <div className="absolute top-3 left-3 bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono tracking-widest border border-yellow-500/30">
                    Champion
                  </div>
                  <Award size={48} className="text-yellow-400 animate-pulse mt-4" />
                  
                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-text-primary text-lg uppercase tracking-wide">
                      {getTeamName(tournament.champion_team_id)}
                    </h4>
                    <span className="font-mono text-xs text-accent font-bold">
                      TAG: {getTeamTag(tournament.champion_team_id)}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-yellow-500/30 p-1 bg-background flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getTeamLogo(tournament.champion_team_id)} alt="" className="w-full h-full" />
                  </div>
                </div>

                {/* 2nd Place: Runner Up */}
                <div className="bg-gradient-to-b from-slate-400/10 to-transparent border border-slate-400/30 rounded-2xl p-6 text-center space-y-4 flex flex-col items-center justify-between relative">
                  <div className="absolute top-3 left-3 bg-slate-400/20 text-slate-300 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono tracking-widest border border-slate-400/20">
                    Runner Up
                  </div>
                  <Trophy size={48} className="text-slate-400 mt-4" />

                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-text-primary text-base uppercase tracking-wide">
                      {getTeamName(tournament.runner_up_team_id)}
                    </h4>
                    <span className="font-mono text-xs text-text-secondary">
                      TAG: {getTeamTag(tournament.runner_up_team_id)}
                    </span>
                  </div>

                  <div className="w-11 h-11 rounded-lg overflow-hidden border border-border/80 p-1 bg-background flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getTeamLogo(tournament.runner_up_team_id)} alt="" className="w-full h-full" />
                  </div>
                </div>

                {/* MVP Player */}
                <div className="bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/30 rounded-2xl p-6 text-center space-y-4 flex flex-col items-center justify-between relative shadow-[0_0_30px_rgba(168,85,247,0.05)]">
                  <div className="absolute top-3 left-3 bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono tracking-widest border border-purple-500/20">
                    MVP Player
                  </div>
                  <Zap size={48} className="text-purple-400 mt-4 animate-bounce duration-[3000ms]" />

                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-text-primary text-base uppercase tracking-wide">
                      {getPlayerName(tournament.mvp_player_id)}
                    </h4>
                    <span className="font-mono text-xs text-text-secondary">
                      UID: {getPlayerUID(tournament.mvp_player_id)}
                    </span>
                  </div>

                  <div className="w-11 h-11 rounded-full overflow-hidden border border-purple-500/30 p-0.5 bg-background flex items-center justify-center">
                    <span className="text-purple-400 font-bold font-display text-sm">MVP</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>

      <RegistrationFlow
        tournament={tournament}
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        onSuccess={loadAllData}
      />
    </Shell>
  );
}
