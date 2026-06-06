import { GameConfig } from "@/types/database.types";

export interface TeamScoreBreakdown {
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
}

export function calculateTeamMatchScore(
  pointsConfig: GameConfig,
  position: number,
  kills: number
): TeamScoreBreakdown {
  const placementPoints = pointsConfig[String(position)] ?? 0;
  const killPoints = kills * (pointsConfig.kill ?? 1);
  
  return {
    placementPoints,
    killPoints,
    totalPoints: placementPoints + killPoints
  };
}
