export interface GameConfig {
  [position: string]: number; // position -> points, e.g. "1": 12, "kill": 1
  kill: number;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  teams_per_room: number;
  finalists: number;
  qualification: "points" | "bracket";
  points_config: GameConfig;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  display_name: string;
  avatar_url?: string | null;
  phone: string | null;
  city: string | null;
  game_uid: string | null;
  telegram_username: string | null;
  telegram_id: number | null;
  role: "player" | "admin";
  created_at: string;
}

// Aliasing Profile for backwards compatibility
export type Profile = User;

export interface Team {
  id: string;
  name: string;
  tag: string; // e.g. SH-7284
  logo_url: string | null;
  captain_id: string;
  primary_game: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  player_id: string;
  status: "pending" | "approved" | "rejected"; // Join request queue!
  role: "captain" | "member" | "substitute";
  joined_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  slug: string;
  game_id: string | null;
  entry_fee: number;
  prize_pool: number;
  max_teams: number;
  qualifier_spots: number;
  status: "draft" | "registration" | "ongoing" | "completed";
  rules: string | null;
  start_date: string;
  end_date: string | null;
  champion_team_id: string | null;
  runner_up_team_id: string | null;
  mvp_player_id: string | null;
  created_at: string;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  team_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface Payment {
  id: string;
  registration_id: string;
  amount: number;
  utr_number: string;
  screenshot_url: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface MatchRoom {
  id: string;
  tournament_id: string;
  round_number: number;
  round_type: "qualifier" | "semi_final" | "grand_final";
  room_label: string; // "Group A", "Group B", etc.
  room_id_code: string | null; // actual in-game room ID (admin enters)
  room_password: string | null;
  scheduled_at: string;
  status: "pending" | "live" | "completed";
  created_at: string;
}

// Backwards compatibility alias
export type Match = MatchRoom;

export interface RoomAssignment {
  id: string;
  room_id: string;
  team_id: string;
  seed_number: number | null;
}

export interface MatchResult {
  id: string;
  match_id: string; // references matches
  team_id: string;
  position: number;
  kills: number;
  placement_points: number;
  kill_points: number;
  total_points: number;
  created_at: string;
}

export interface TournamentStanding {
  id: string;
  tournament_id: string;
  team_id: string;
  total_matches: number;
  total_kills: number;
  total_points: number;
  current_rank: number | null;
  qualification_status: "pending" | "qualified" | "eliminated";
  updated_at: string;
}

export interface NotificationLog {
  id: string;
  telegram_id: number;
  message_text: string;
  sent_at: string;
  status: "sent" | "failed";
}
