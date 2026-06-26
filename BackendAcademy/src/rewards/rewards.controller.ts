import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import type {
  UserProgressionResponse,
  ThresholdsResponse,
  LevelThreshold,
} from './interfaces/rewards.interfaces';

/**
 * RewardsController
 *
 * Exposes the XP, level, and progression-threshold API.
 *
 * Routes:
 *   GET /rewards/thresholds              – full level table (1–50)
 *   GET /rewards/thresholds/:level       – single level threshold
 *   GET /rewards/progression/:userId     – user's XP + current level + progress to next
 */
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  /**
   * Returns the complete progression table: all 50 levels with their
   * XP requirements and display titles.
   *
   * @example
   *   GET /rewards/thresholds
   *   → { thresholds: [{ level: 1, xpRequired: 0, title: "Newcomer" }, …] }
   */
  @Get('thresholds')
  @HttpCode(HttpStatus.OK)
  getAllThresholds(): ThresholdsResponse {
    return this.rewardsService.getAllThresholds();
  }

  /**
   * Returns the XP threshold and title for a specific level.
   *
   * @param level  Integer between 1 and 50 (inclusive)
   *
   * @example
   *   GET /rewards/thresholds/10
   *   → { level: 10, xpRequired: 8100, title: "Practitioner" }
   */
  @Get('thresholds/:level')
  @HttpCode(HttpStatus.OK)
  getLevelThreshold(
    @Param('level', ParseIntPipe) level: number,
  ): LevelThreshold {
    return this.rewardsService.getLevelThreshold(level);
  }

  /**
   * Returns a user's accumulated XP, current level, XP required to reach
   * the next level, and the raw threshold values for the current and next levels.
   *
   * @param userId  UUID (or any string identifier) of the target user
   *
   * @example
   *   GET /rewards/progression/abc-123
   *   → {
   *       userId: "abc-123",
   *       xp: 550,
   *       level: 3,
   *       xpToNextLevel: 50,
   *       currentLevelThreshold: 400,
   *       nextLevelThreshold: 600
   *     }
   */
  @Get('progression/:userId')
  @HttpCode(HttpStatus.OK)
  getUserProgression(
    @Param('userId') userId: string,
  ): UserProgressionResponse {
    return this.rewardsService.getUserProgression(userId);
  }
}
