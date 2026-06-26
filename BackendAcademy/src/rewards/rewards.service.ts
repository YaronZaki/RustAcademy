import { Injectable, NotFoundException } from '@nestjs/common';
import {
  MAX_LEVEL,
  levelForXp,
  xpThresholdForLevel,
  xpToNextLevel,
} from './rewards.constants';
import type {
  LevelThreshold,
  UserProgressionResponse,
  ThresholdsResponse,
} from './interfaces/rewards.interfaces';

/**
 * In-memory XP store used until a persistence layer is wired in.
 *
 * Keyed by userId → total accumulated XP.
 * Replace this Map with a TypeORM / Prisma repository call in
 * production — the service interface will remain unchanged.
 */
const xpStore = new Map<string, number>();

/**
 * Deterministic level title names for display purposes.
 * Covers levels 1-50. Titles repeat their tier name with a numeric suffix
 * beyond the named entries so the list is always complete.
 */
function levelTitle(level: number): string {
  const titles: Record<number, string> = {
    1: 'Newcomer',
    5: 'Apprentice',
    10: 'Practitioner',
    15: 'Journeyman',
    20: 'Specialist',
    25: 'Expert',
    30: 'Senior',
    35: 'Master',
    40: 'Grandmaster',
    45: 'Legend',
    50: 'Academy Champion',
  };
  // Walk backwards to find the closest tier label
  for (let t = level; t >= 1; t--) {
    if (titles[t]) {
      const offset = level - t;
      return offset === 0 ? titles[t] : `${titles[t]} ${offset}`;
    }
  }
  return `Level ${level}`;
}

@Injectable()
export class RewardsService {
  /**
   * Returns the complete list of level thresholds (levels 1 – MAX_LEVEL).
   * This is static configuration data and never changes at runtime.
   */
  getAllThresholds(): ThresholdsResponse {
    const thresholds: LevelThreshold[] = [];
    for (let level = 1; level <= MAX_LEVEL; level++) {
      thresholds.push({
        level,
        xpRequired: xpThresholdForLevel(level),
        title: levelTitle(level),
      });
    }
    return { thresholds };
  }

  /**
   * Returns a single level's threshold details.
   *
   * @throws NotFoundException if the level is outside [1, MAX_LEVEL]
   */
  getLevelThreshold(level: number): LevelThreshold {
    if (level < 1 || level > MAX_LEVEL) {
      throw new NotFoundException(
        `Level ${level} does not exist. Valid range: 1–${MAX_LEVEL}.`,
      );
    }
    return {
      level,
      xpRequired: xpThresholdForLevel(level),
      title: levelTitle(level),
    };
  }

  /**
   * Returns the current XP, level, and progression data for a given user.
   *
   * @throws NotFoundException if the userId is unknown
   */
  getUserProgression(userId: string): UserProgressionResponse {
    const xp = xpStore.get(userId);
    if (xp === undefined) {
      throw new NotFoundException(
        `User '${userId}' not found in the rewards system.`,
      );
    }

    const level = levelForXp(xp);
    const remaining = xpToNextLevel(xp, level);
    const nextThreshold =
      level < MAX_LEVEL ? xpThresholdForLevel(level + 1) : null;

    return {
      userId,
      xp,
      level,
      xpToNextLevel: remaining,
      currentLevelThreshold: xpThresholdForLevel(level),
      nextLevelThreshold: nextThreshold,
    };
  }

  /**
   * Adds XP to a user, creating the record if it does not yet exist.
   * Used in tests and by future gamification hooks.
   *
   * @param userId   Target user
   * @param amount   XP to add (must be > 0)
   * @returns        Updated progression data
   */
  addXp(userId: string, amount: number): UserProgressionResponse {
    if (amount <= 0) {
      throw new Error('XP amount must be a positive integer.');
    }
    const current = xpStore.get(userId) ?? 0;
    xpStore.set(userId, current + amount);
    return this.getUserProgression(userId);
  }

  /**
   * Resets a user's XP to zero (useful for testing / admin tooling).
   */
  resetXp(userId: string): void {
    xpStore.set(userId, 0);
  }
}
