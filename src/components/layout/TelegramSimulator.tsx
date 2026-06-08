"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { NotificationLog } from "@/types/database.types";
import { MessageSquare, X, Send, Bell, Trash2 } from "lucide-react";

export default function TelegramSimulator() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [isLinked, setIsLinked] = useState(false);

  // Poll notifications from local database
  useEffect(() => {
    const checkNotifs = () => {
      if (!db) return;
      const notifs = db.getNotifications();
      setNotifications(notifs);
      
      const user = db.getCurrentUser();
      setIsLinked(!!user.telegram_id);
    };

    checkNotifs();
    const interval = setInterval(checkNotifs, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update unread count when closed
  useEffect(() => {
    if (!isOpen) {
      setUnreadCount(notifications.length);
    } else {
      setUnreadCount(0);
    }
  }, [notifications, isOpen]);

  const handleClear = () => {
    if (!db) return;
    db.clearNotifications();
    setNotifications([]);
  };

  const handleSendStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !db) return;

    const text = chatInput.trim();
    setChatInput("");

    const simulatorChatId = 12345678;

    // Helper to find profile linked to this simulator chat ID
    const getLinkedUser = () => {
      return db.getProfiles().find(p => p.telegram_id === simulatorChatId);
    };

    if (text.startsWith("/start")) {
      const arg = text.replace("/start", "").trim().replace("@", "");
      
      if (!arg) {
        db.pushNotification(
          simulatorChatId,
          `🤖 Crew Arena Bot:\nTo link your account, please send: /start <your_telegram_username>\nExample: /start arpit0381`
        );
        return;
      }

      // If user typed VERIFY or code, try to link current logged-in user
      if (arg.toUpperCase() === "VERIFY123" || arg.toUpperCase().startsWith("VERIFY")) {
        const currentUser = db.getCurrentUser();
        if (currentUser && currentUser.id) {
          const tgUser = currentUser.telegram_username || currentUser.username;
          db.linkTelegram(tgUser, simulatorChatId);
          db.pushNotification(
            simulatorChatId,
            `🤖 Bot: Connected successfully!\nLogged in as ${currentUser.display_name} (@${tgUser}).`
          );
        } else {
          db.pushNotification(
            simulatorChatId,
            `🤖 Bot: ❌ Please login to the website first to link your account.`
          );
        }
        return;
      }

      // Find user by Telegram username or username
      const foundUser = db.getProfiles().find(p => 
        (p.telegram_username || "").toLowerCase() === arg.toLowerCase() ||
        p.username.toLowerCase() === arg.toLowerCase()
      );

      if (foundUser) {
        db.linkTelegram(foundUser.telegram_username || arg, simulatorChatId);
      } else {
        db.pushNotification(
          simulatorChatId,
          `🤖 Bot: ❌ Error: User "${arg}" doesn't exist in the database.\n\nPlease set your Telegram Username to "${arg}" on the Profile Settings page first, then run: /start ${arg}`
        );
      }

    } else if (text === "/status") {
      const linkedUser = getLinkedUser();
      if (linkedUser) {
        db.pushNotification(
          simulatorChatId,
          `🤖 Telegram Status:\nConnected Account: ${linkedUser.name} (@${linkedUser.telegram_username})\nRole: ${linkedUser.role.toUpperCase()}\nTelegram ID: ${linkedUser.telegram_id}`
        );
      } else {
        db.pushNotification(
          simulatorChatId,
          `🤖 Telegram Status:\nNot connected. Send /start <telegram_username> to link your account.`
        );
      }

    } else if (text === "/profile") {
      const linkedUser = getLinkedUser();
      if (linkedUser) {
        db.pushNotification(
          simulatorChatId,
          `👤 Fighter Profile:\nName: ${linkedUser.display_name}\nUsername: @${linkedUser.username}\nGame UID: ${linkedUser.game_uid || "None"}\nCity: ${linkedUser.city || "Not Specified"}\nRole: ${linkedUser.role.toUpperCase()}`
        );
      } else {
        db.pushNotification(
          simulatorChatId,
          `🤖 Bot: ❌ No connected account found. Link it using:\n/start <telegram_username>`
        );
      }

    } else if (text === "/myteam") {
      const linkedUser = getLinkedUser();
      if (!linkedUser) {
        db.pushNotification(
          simulatorChatId,
          `🤖 Bot: ❌ Please link your account first using /start <telegram_username>`
        );
        return;
      }

      const allTeams = db.getTeams();
      const allMembers = db.getTeams().map(t => db.getTeamMembers(t.id)).flat();
      const userMemberships = allMembers.filter(m => m.player_id === linkedUser.id && m.status === "approved");
      
      if (userMemberships.length === 0) {
        db.pushNotification(
          simulatorChatId,
          `👥 My Teams:\nYou are not currently registered in any team rosters.`
        );
        return;
      }

      let responseText = `👥 My Teams:\n`;
      userMemberships.forEach((m, index) => {
        const team = allTeams.find(t => t.id === m.team_id);
        if (team) {
          responseText += `${index + 1}. ${team.name} (Tag: ${team.tag}) - Role: ${m.role.toUpperCase()}\n`;
        }
      });
      db.pushNotification(simulatorChatId, responseText);

    } else if (text === "/matches") {
      const linkedUser = getLinkedUser();
      if (!linkedUser) {
        db.pushNotification(
          simulatorChatId,
          `🤖 Bot: ❌ Please link your account first using /start <telegram_username>`
        );
        return;
      }

      const allTeams = db.getTeams();
      const allMembers = db.getTeams().map(t => db.getTeamMembers(t.id)).flat();
      const userTeamIds = allMembers
        .filter(m => m.player_id === linkedUser.id && m.status === "approved")
        .map(m => m.team_id);

      if (userTeamIds.length === 0) {
        db.pushNotification(
          simulatorChatId,
          `... Upcoming Lobbies:\nYou have no team rosters, so you are not registered in any matches.`
        );
        return;
      }

      const userRegs = db.getRegistrations().filter(r => userTeamIds.includes(r.team_id) && r.status === "approved");
      const userTourneyIds = userRegs.map(r => r.tournament_id);

      if (userTourneyIds.length === 0) {
        db.pushNotification(
          simulatorChatId,
          `... Upcoming Lobbies:\nYour teams are not registered in any active tournaments.`
        );
        return;
      }

      const userRooms = db.getRooms().filter(r => userTourneyIds.includes(r.tournament_id));

      if (userRooms.length === 0) {
        db.pushNotification(
          simulatorChatId,
          `... Upcoming Lobbies:\nNo rooms have been scheduled/drawn yet for your tournaments.`
        );
        return;
      }

      let responseText = `... Upcoming Lobbies:\n`;
      userRooms.forEach((room) => {
        const tourney = db.getTournamentById(room.tournament_id);
        responseText += `🏆 ${tourney?.name || "League"}\n`;
        responseText += `- Room: ${room.room_label} (${room.round_type.toUpperCase()})\n`;
        responseText += `- Room ID: \`${room.room_id_code || "TBD"}\`\n`;
        responseText += `- Password: \`${room.room_password || "TBD"}\`\n`;
        responseText += `- Status: ${room.status.toUpperCase()}\n\n`;
      });
      db.pushNotification(simulatorChatId, responseText);

    } else if (text === "/results") {
      const linkedUser = getLinkedUser();
      if (!linkedUser) {
        db.pushNotification(
          simulatorChatId,
          `🤖 Bot: ❌ Please link your account first using /start <telegram_username>`
        );
        return;
      }

      const allTeams = db.getTeams();
      const allMembers = db.getTeams().map(t => db.getTeamMembers(t.id)).flat();
      const userTeamIds = allMembers
        .filter(m => m.player_id === linkedUser.id && m.status === "approved")
        .map(m => m.team_id);

      if (userTeamIds.length === 0) {
        db.pushNotification(
          simulatorChatId,
          `📊 Latest Results:\nYou are not on any team roster.`
        );
        return;
      }

      const userResults = db.getResults().filter(r => userTeamIds.includes(r.team_id));

      if (userResults.length === 0) {
        db.pushNotification(
          simulatorChatId,
          `📊 Latest Results:\nNo match results have been entered for your rosters yet.`
        );
        return;
      }

      let responseText = `📊 Latest Results:\n`;
      userResults.slice(0, 5).forEach((res) => {
        const room = db.getRooms().find(rm => rm.id === res.match_id);
        const team = allTeams.find(t => t.id === res.team_id);
        if (room && team) {
          responseText += `Lobby: ${room.room_label}\n`;
          responseText += `- Team: ${team.name}\n`;
          responseText += `- Rank: #${res.position}\n`;
          responseText += `- Kills: ${res.kills}\n`;
          responseText += `- Total points: ${res.total_points} pts\n\n`;
        }
      });
      db.pushNotification(simulatorChatId, responseText);

    } else if (text === "/help") {
      db.pushNotification(
        simulatorChatId,
        `🤖 Crew Arena Bot Commands:\n/start <telegram_username> - Link your account\n/profile - View profile info\n/myteam - View your team rosters\n/matches - View scheduled match rooms & credentials\n/results - View match results\n/status - Check connection status\n/help - View help information`
      );
    } else {
      db.pushNotification(
        simulatorChatId,
        `🤖 Bot: Received "${text}". Type /help to see all available commands.`
      );
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expandable Bot Window */}
      {isOpen ? (
        <div className="w-80 sm:w-96 h-[480px] bg-slate-950 border border-accent/40 rounded-2xl flex flex-col shadow-[0_0_30px_rgba(0,212,255,0.2)] overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-slate-900 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/40">
                <span className="text-accent text-xs font-bold font-display">CA</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">Crew Arena Bot Simulator</h4>
                <p className="text-[10px] text-accent flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Active Webhook
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleClear}
                title="Clear Logs"
                className="p-1 hover:bg-white/10 rounded text-text-secondary hover:text-red-400 transition"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded text-text-secondary hover:text-text-primary transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Setup / Instructions banner */}
          {!isLinked && (
            <div className="bg-accent/10 p-2 text-center text-[10px] text-accent border-b border-accent/20">
              💡 Link account: Type <code className="bg-black/50 px-1 py-0.5 rounded font-mono">/start &lt;your_telegram_username&gt;</code> (e.g. /start arpit0381)
            </div>
          )}

          {/* Chat Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col-reverse">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-secondary">
                <Bell size={24} className="opacity-30 mb-2 animate-bounce" />
                <p className="text-xs">No notifications sent yet.</p>
                <p className="text-[10px] mt-1 opacity-60">Actions like Room assignments, Payment approval, or Results entry will push live notifications here.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="flex flex-col gap-1">
                  <div className="self-start bg-slate-900 border border-border/80 text-text-primary text-xs rounded-2xl rounded-tl-none p-3 max-w-[85%] shadow-md">
                    <div className="text-[10px] text-accent/80 font-semibold mb-1 uppercase tracking-wider">
                      STATUS: {notif.status}
                    </div>
                    <p className="whitespace-pre-line leading-relaxed font-sans">{notif.message_text}</p>
                  </div>
                  <span className="text-[9px] text-text-secondary/60 ml-2">
                    {new Date(notif.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Input Area (Mock Bot Control) */}
          <form onSubmit={handleSendStart} className="p-3 bg-slate-900 border-t border-border flex gap-2">
            <input
              type="text"
              placeholder="Send bot command (/status, /help)..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-black/60 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent text-text-primary placeholder:text-text-secondary/40 font-mono"
            />
            <button
              type="submit"
              className="p-2 bg-accent hover:bg-accent-hover text-black font-semibold rounded-xl flex items-center justify-center transition"
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      ) : (
        /* Floating Button Indicator */
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 bg-accent text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:scale-105 transition duration-200"
        >
          <MessageSquare size={22} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-black">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
