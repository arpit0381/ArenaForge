import { Tournament, MatchRoom, RoomAssignment, TournamentStanding } from "@/types/database.types";
import { generateUUID } from "../db";

export function determineQualifiers(
  standings: TournamentStanding[],
  qualifierSpots: number
): { qualifiedTeamIds: string[]; eliminatedTeamIds: string[] } {
  // Sort standings by rank
  const sorted = [...standings].sort((a, b) => (a.current_rank || 999) - (b.current_rank || 999));
  
  const qualifiedTeamIds = sorted.slice(0, qualifierSpots).map(s => s.team_id);
  const eliminatedTeamIds = sorted.slice(qualifierSpots).map(s => s.team_id);
  
  return { qualifiedTeamIds, eliminatedTeamIds };
}

export function generateGrandFinalRoom(
  tournament: Tournament,
  qualifiedTeamIds: string[]
): { room: MatchRoom; assignments: RoomAssignment[] } {
  const roomId = generateUUID();
  
  const room: MatchRoom = {
    id: roomId,
    tournament_id: tournament.id,
    round_number: 2, // Round 2 is Finals
    round_type: "grand_final",
    room_label: "Grand Final",
    room_id_code: null,
    room_password: null,
    scheduled_at: new Date(Date.now() + 172800000).toISOString(),
    status: "pending",
    created_at: new Date().toISOString()
  };
  
  const assignments = qualifiedTeamIds.map((teamId, idx) => ({
    id: generateUUID(),
    room_id: roomId,
    team_id: teamId,
    seed_number: idx + 1
  }));
  
  return { room, assignments };
}

export function autoGenerateGrandFinal(
  tournament: Tournament,
  dbInstance: any
): { room: MatchRoom; assignments: RoomAssignment[] } | null {
  const standings = dbInstance.getStandings(tournament.id);
  if (standings.length === 0) return null;

  const { qualifiedTeamIds } = determineQualifiers(standings, tournament.qualifier_spots);
  if (qualifiedTeamIds.length === 0) return null;

  const { room, assignments } = generateGrandFinalRoom(tournament, qualifiedTeamIds);
  dbInstance.saveRoomsAndAssignments([room], assignments);
  
  // Public channel broadcast automation
  dbInstance.pushNotification(
    9999,
    `📢 GRAND FINAL MATCH ROOM CREATED:\n🏆 Tournament: *${tournament.name}*\nTeams competing: ${qualifiedTeamIds.length}\nRoom scheduled successfully.`
  );

  return { room, assignments };
}
