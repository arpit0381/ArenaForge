import { Team, MatchRoom, RoomAssignment, Tournament } from "@/types/database.types";
import { generateUUID } from "../db";

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateRooms(
  tournament: Tournament,
  registeredTeams: Team[],
  teamsPerRoom: number
): { rooms: MatchRoom[]; assignments: RoomAssignment[] } {
  const shuffled = shuffleArray(registeredTeams);
  const rooms: MatchRoom[] = [];
  const assignments: RoomAssignment[] = [];
  
  const totalRoomsNeeded = Math.ceil(shuffled.length / teamsPerRoom);
  
  for (let i = 0; i < totalRoomsNeeded; i++) {
    const roomId = generateUUID();
    // Use user-requested label format: Group A, Group B, Group C...
    const roomLabel = `Group ${String.fromCharCode(65 + i)}`; 
    
    rooms.push({
      id: roomId,
      tournament_id: tournament.id,
      round_number: 1,
      round_type: "qualifier",
      room_label: roomLabel,
      room_id_code: null,
      room_password: null,
      scheduled_at: new Date(Date.now() + 86400000).toISOString(),
      status: "pending",
      created_at: new Date().toISOString()
    });
    
    const slice = shuffled.slice(i * teamsPerRoom, (i + 1) * teamsPerRoom);
    slice.forEach((team, seedIdx) => {
      assignments.push({
        id: generateUUID(),
        room_id: roomId,
        team_id: team.id,
        seed_number: seedIdx + 1
      });
    });
  }
  
  return { rooms, assignments };
}
