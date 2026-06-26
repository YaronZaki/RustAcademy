/**
 * XP Progression configuration.
 *
 * Defines how many XP are needed to reach each level and the
 * threshold (minimum XP) required to enter that level.
 * Levels use a quadratic formula: threshold(n) = 100 * n^2
 * so that advancement becomes increasingly challenging.
 *
 * The maximum tracked level is 50. Users may accumulate XP beyond
 * level 50 but their `level` field is capped at 50.
 */
export const MAX_LEVEL = 50;

/**
 * Returns the total XP required to reach the beginning of `level`.
 * Level 1 starts at 0 XP; each subsequent level requires 100 * n^2 XP
 * where n is the level number.
 *
 * @param level  Target level (1 – MAX_LEVEL)
 */
export function xpThresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  return 100 * (level - 1) * (level - 1);
}

/**
 * Computes the current level for a given total XP value.
 * Searches for the highest level whose threshold is ≤ xp.
 *
 * @param xp  Total accumulated XP (non-negative integer)
 */
export function levelForXp(xp: number): number {
  let level = 1;
  for (let n = 2; n <= MAX_LEVEL; n++) {
    if (xp >= xpThresholdForLevel(n)) {
      level = n;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Computes how much XP is still needed to reach the next level.
 * Returns 0 if the user is already at MAX_LEVEL.
 *
 * @param xp     Total accumulated XP
 * @param level  Current level (as computed by `levelForXp`)
 */
export function xpToNextLevel(xp: number, level: number): number {
  if (level >= MAX_LEVEL) return 0;
  return xpThresholdForLevel(level + 1) - xp;
}
