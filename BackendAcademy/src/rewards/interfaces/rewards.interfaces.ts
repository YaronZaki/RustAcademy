/**
 * Single level entry as returned by the thresholds endpoint.
 */
export interface LevelThreshold {
  /** Level number (1 – 50) */
  level: number;
  /** Total XP required to reach this level */
  xpRequired: number;
  /** Human-readable label */
  title: string;
}

/**
 * Information about a user's current activity streak.
 */
export interface StreakInfo {
  /** Number of consecutive days of activity */
  currentStreak: number;
  /** The last date on which the user was active (ISO 8601 format) */
  lastActivityDate: string | null;
}

/**
 * Response shape for GET /rewards/progression/:userId
 */
export interface UserProgressionResponse {
  userId: string;
  xp: number;
  level: number;
  xpToNextLevel: number;
  /** XP required to enter the current level */
  currentLevelThreshold: number;
  /** XP required to enter the next level (null at max level) */
  nextLevelThreshold: number | null;
  /** User's current activity streak information */
  streak: StreakInfo;
}

/**
 * Response shape for GET /rewards/thresholds
 */
export interface ThresholdsResponse {
  thresholds: LevelThreshold[];
}
