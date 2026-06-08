"use client";

import React, { useEffect, useState } from "react";
import Shell from "@/components/layout/Shell";
import { db } from "@/lib/db";
import { Team, Game, TeamMember, User } from "@/types/database.types";
import { Plus, Users, Shield, Award, Check, X, Gamepad2, ArrowRight } from "lucide-react";

export default function TeamManagementPage() {
  const [captainedTeams, setCaptainedTeams] = useState<Team[]>([]);
  const [joinedTeams, setJoinedTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | "create" | "join">("list");
  
  // Form states
  const [teamName, setTeamName] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = () => {
    if (!db) return;
    const currentUser = db.getCurrentUser();
    const allTeams = db.getTeams();
    
    // Load teams captained by current user
    const userCapTeams = allTeams.filter(t => t.captain_id === currentUser.id);
    setCaptainedTeams(userCapTeams);
    
    // Load teams user has joined or requested to join
    const userJoinTeams = allTeams.filter(t => {
      if (t.captain_id === currentUser.id) return false;
      const members = db.getTeamMembers(t.id);
      return members.some(m => m.player_id === currentUser.id);
    });
    setJoinedTeams(userJoinTeams);
    
    setGames(db.getGames());
    setProfiles(db.getProfiles());
  };

  useEffect(() => {
    loadData();
    window.addEventListener("db-sync", loadData);
    return () => window.removeEventListener("db-sync", loadData);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!teamName.trim() || !selectedGame) {
      setError("Please fill in all fields.");
      return;
    }

    if (!db) return;
    const team = db.createTeam(teamName.trim(), selectedGame);
    setSuccess(`Team ${team.name} created successfully! Team Code: ${team.tag}`);
    setTeamName("");
    setSelectedGame("");
    loadData();
    setTimeout(() => {
      setActiveTab("list");
      setSuccess("");
    }, 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!inviteCode.trim()) {
      setError("Please enter a valid Team Code.");
      return;
    }

    if (!db) return;
    const ok = db.sendJoinRequest(inviteCode.trim());
    if (ok) {
      setSuccess(`Request to join team roster successfully sent to Captain! Waiting for approval.`);
      setInviteCode("");
      loadData();
      setTimeout(() => {
        setActiveTab("list");
        setSuccess("");
      }, 2000);
    } else {
      setError("Invalid Team Code. Try 'SH-7284' or 'GE-2345'.");
    }
  };

  const handleApproveRequest = (memberId: string) => {
    if (!db) return;
    db.approveJoinRequest(memberId);
    setSuccess("Roster member approved!");
    loadData();
    setTimeout(() => setSuccess(""), 2000);
  };

  const handleRejectRequest = (memberId: string) => {
    if (!db) return;
    db.rejectJoinRequest(memberId);
    setError("Roster member request rejected.");
    loadData();
    setTimeout(() => setError(""), 2000);
  };

  const getGameName = (gameId: string | null) => {
    if (!gameId) return "Unknown Game";
    const game = games.find(g => g.id === gameId);
    return game ? game.name : "Unknown Game";
  };

  const getRosterSizeText = (gameId: string | null) => {
    if (!gameId) return "4 Players";
    if (gameId === "bf81850d-d421-4ea9-a111-ce1515bb5c81") return "10 Teams Room (FF Mode)";
    if (gameId === "e12bd84d-2df9-4c12-841f-1ad078d10b72") return "25 Teams Room (BGMI Mode)";
    if (gameId === "c26be6fd-1d88-43e5-8b83-a9d02f5a5423") return "5v5 (Valorant Mode)";
    return "4 Players";
  };

  const getPlayerName = (playerId: string) => {
    const p = profiles.find(profile => profile.id === playerId);
    return p ? p.name : "Anonymous Gamer";
  };

  const getPlayerUID = (playerId: string) => {
    const p = profiles.find(profile => profile.id === playerId);
    return p ? p.game_uid || "No UID" : "No UID";
  };

  const getMemberStatus = (teamId: string) => {
    if (!db) return "pending";
    const currentUser = db.getCurrentUser();
    const match = db.getTeamMembers(teamId).find(m => m.player_id === currentUser.id);
    return match ? match.status : "pending";
  };

  return (
    <Shell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display uppercase tracking-wide">
              Team Roster Deck
            </h1>
            <p className="text-xs text-text-secondary">
              Assemble your squad, generate team codes, and approve roster applications.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab("list"); setError(""); setSuccess(""); }}
              className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition ${
                activeTab === "list"
                  ? "bg-accent text-black border-accent"
                  : "bg-surface text-text-secondary border-border hover:text-text-primary"
              }`}
            >
              Roster View
            </button>
            <button
              onClick={() => { setActiveTab("create"); setError(""); setSuccess(""); }}
              className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition flex items-center gap-1.5 ${
                activeTab === "create"
                  ? "bg-accent text-black border-accent"
                  : "bg-surface text-text-secondary border-border hover:text-text-primary"
              }`}
            >
              <Plus size={14} />
              <span>Create Team</span>
            </button>
            <button
              onClick={() => { setActiveTab("join"); setError(""); setSuccess(""); }}
              className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition ${
                activeTab === "join"
                  ? "bg-accent text-black border-accent"
                  : "bg-surface text-text-secondary border-border hover:text-text-primary"
              }`}
            >
              Join Team
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-semibold animate-shake">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-green-400 font-semibold animate-pulse">
            ✓ {success}
          </div>
        )}

        {/* Tab 1: Teams List + Captain approval queue */}
        {activeTab === "list" && (
          <div className="space-y-6">
            
            {captainedTeams.length === 0 && joinedTeams.length === 0 ? (
              <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-secondary">
                <Users size={36} className="mx-auto opacity-30 mb-3" />
                <h3 className="font-display font-semibold text-text-primary uppercase tracking-wider text-base">
                  No active squads found
                </h3>
                <p className="text-xs mt-1 max-w-sm mx-auto">
                  Get started by creating your esports squad or joining a captain&apos;s squad with their Team Code.
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <button
                    onClick={() => setActiveTab("create")}
                    className="bg-accent hover:bg-accent-hover text-black px-4 py-2 rounded-lg text-xs font-bold uppercase transition"
                  >
                    Create Team
                  </button>
                  <button
                    onClick={() => setActiveTab("join")}
                    className="bg-background border border-border hover:border-text-primary text-text-secondary px-4 py-2 rounded-lg text-xs font-bold uppercase transition"
                  >
                    Join with Team Code
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Teams List */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Section A: Captained Teams */}
                  {captainedTeams.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold font-display uppercase tracking-widest text-text-secondary/60">
                        Teams You Captain ({captainedTeams.length})
                      </h3>
                      {captainedTeams.map((team) => {
                        if (!db) return null;
                        const members = db.getTeamMembers(team.id).filter(m => m.status === "approved");
                        return (
                          <div
                            key={team.id}
                            className="bg-surface border border-border hover:border-accent/30 rounded-2xl p-5 space-y-4 hover:scale-[1.01] transition duration-200"
                          >
                            <div className="flex items-center justify-between border-b border-border/40 pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center p-1 overflow-hidden">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={team.logo_url || ""} alt="" className="w-full h-full" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-text-primary text-sm uppercase tracking-wide">{team.name}</h3>
                                  <span className="text-[10px] text-accent font-semibold">{getGameName(team.primary_game)}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] text-text-secondary uppercase font-bold">Team Code</span>
                                <span className="font-mono text-accent font-extrabold text-sm tracking-wider select-all">{team.tag}</span>
                              </div>
                            </div>

                            {/* Roster members list */}
                            <div className="space-y-2">
                              <h4 className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Approved Roster ({members.length})</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {members.map(m => (
                                  <div key={m.id} className="p-2.5 bg-background/50 border border-border/60 rounded-xl flex items-center justify-between text-xs">
                                    <span className="font-bold text-text-primary">{getPlayerName(m.player_id)}</span>
                                    <span className="text-[9px] text-text-secondary font-mono">UID: {getPlayerUID(m.player_id)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Section B: Joined Teams */}
                  {joinedTeams.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold font-display uppercase tracking-widest text-text-secondary/60">
                        Joined Teams ({joinedTeams.length})
                      </h3>
                      {joinedTeams.map((team) => {
                        if (!db) return null;
                        const members = db.getTeamMembers(team.id).filter(m => m.status === "approved");
                        const status = getMemberStatus(team.id);
                        return (
                          <div
                            key={team.id}
                            className="bg-surface border border-border hover:border-accent/30 rounded-2xl p-5 space-y-4 hover:scale-[1.01] transition duration-200"
                          >
                            <div className="flex items-center justify-between border-b border-border/40 pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center p-1 overflow-hidden">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={team.logo_url || ""} alt="" className="w-full h-full" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-text-primary text-sm uppercase tracking-wide">{team.name}</h3>
                                  <span className="text-[10px] text-accent font-semibold">{getGameName(team.primary_game)}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] text-text-secondary uppercase font-bold">Roster Status</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider mt-1 ${
                                  status === "approved"
                                    ? "bg-green-500/10 border border-green-500/20 text-green-400"
                                    : status === "rejected"
                                    ? "bg-red-500/10 border border-red-500/20 text-red-400"
                                    : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 animate-pulse"
                                }`}>
                                  {status === "approved" ? "Approved Member" : status === "rejected" ? "Rejected" : "Pending Approval"}
                                </span>
                              </div>
                            </div>

                            {/* Roster members list */}
                            <div className="space-y-2">
                              <h4 className="text-[10px] text-text-secondary uppercase font-bold tracking-widest font-sans">Active Roster ({members.length})</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {members.map(m => (
                                  <div key={m.id} className="p-2.5 bg-background/50 border border-border/60 rounded-xl flex items-center justify-between text-xs">
                                    <span className="font-bold text-text-primary">{getPlayerName(m.player_id)}</span>
                                    <span className="text-[9px] text-text-secondary font-mono">UID: {getPlayerUID(m.player_id)}</span>
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

                {/* Captain Approvals Request Queue */}
                <div className="space-y-4">
                  <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold font-display text-text-primary uppercase tracking-widest flex items-center gap-2">
                      <Shield size={16} className="text-accent" /> Join Requests Queue
                    </h3>

                    {captainedTeams.map(t => {
                      if (!db) return null;
                      const requests = db.getTeamMembers(t.id).filter(m => m.status === "pending");
                      if (requests.length === 0) return null;
                      return (
                        <div key={t.id} className="space-y-2.5">
                          <span className="text-[9px] text-accent uppercase font-bold tracking-wider">{t.name} Requests</span>
                          {requests.map(req => (
                            <div key={req.id} className="p-3 bg-background border border-border rounded-xl flex flex-col gap-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-text-primary">{getPlayerName(req.player_id)}</span>
                                <span className="text-[9px] text-text-secondary font-mono">UID: {getPlayerUID(req.player_id)}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveRequest(req.id)}
                                  className="flex-1 bg-green-500/10 hover:bg-green-500 border border-green-500/30 hover:border-green-500 text-green-400 hover:text-black py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Check size={12} />
                                  <span>Accept</span>
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(req.id)}
                                  className="flex-1 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <X size={12} />
                                  <span>Reject</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}

                    {captainedTeams.every(t => !db || db.getTeamMembers(t.id).filter(m => m.status === "pending").length === 0) && (
                      <p className="text-xs text-text-secondary/70 italic text-center py-4">No pending join requests.</p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Tab 2: Create Squad */}
        {activeTab === "create" && (
          <div className="max-w-xl mx-auto bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold font-display text-text-primary uppercase tracking-wide">
                Create Esports Team
              </h3>
              <p className="text-xs text-text-secondary">
                Enter your squad details. The system generates unique team codes (e.g., SH-7284) to invite your roster.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shadow Hunters, Hydra Esports"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-accent text-text-primary transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                  Primary Game Format
                </label>
                <select
                  required
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:border-accent text-text-primary transition-colors cursor-pointer"
                >
                  <option value="" disabled>Select game type...</option>
                  {games.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({getRosterSizeText(g.id)})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent-hover text-black py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01] transition cursor-pointer"
              >
                <span>Assemble Team & Generate Code</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Join Squad */}
        {activeTab === "join" && (
          <div className="max-w-xl mx-auto bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold font-display text-text-primary uppercase tracking-wide">
                Join Squad
              </h3>
              <p className="text-xs text-text-secondary">
                Enter the team code supplied by your Captain to send a join request application.
              </p>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                  Team Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SH-7284, GE-2345"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-accent text-text-primary font-mono uppercase tracking-widest text-center text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent-hover text-black py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Submit Join Request</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        )}

      </div>
    </Shell>
  );
}
