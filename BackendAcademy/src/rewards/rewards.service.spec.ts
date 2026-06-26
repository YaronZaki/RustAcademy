import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import {
  MAX_LEVEL,
  levelForXp,
  xpThresholdForLevel,
  xpToNextLevel,
} from './rewards.constants';

// ---------------------------------------------------------------------------
// Pure helper unit tests — no NestJS container needed
// ---------------------------------------------------------------------------

describe('rewards.constants helpers', () => {
  describe('xpThresholdForLevel', () => {
    it('level 1 starts at 0 XP', () => {
      expect(xpThresholdForLevel(1)).toBe(0);
    });

    it('level 2 requires 100 XP', () => {
      expect(xpThresholdForLevel(2)).toBe(100);
    });

    it('level 3 requires 400 XP', () => {
      expect(xpThresholdForLevel(3)).toBe(400);
    });

    it('level 10 requires 8100 XP', () => {
      expect(xpThresholdForLevel(10)).toBe(8100);
    });

    it('level 50 (MAX) returns a positive value', () => {
      expect(xpThresholdForLevel(MAX_LEVEL)).toBeGreaterThan(0);
    });
  });

  describe('levelForXp', () => {
    it('0 XP → level 1', () => {
      expect(levelForXp(0)).toBe(1);
    });

    it('99 XP → level 1 (threshold for L2 is 100)', () => {
      expect(levelForXp(99)).toBe(1);
    });

    it('100 XP → level 2', () => {
      expect(levelForXp(100)).toBe(2);
    });

    it('400 XP → level 3', () => {
      expect(levelForXp(400)).toBe(3);
    });

    it('large XP value caps at MAX_LEVEL', () => {
      expect(levelForXp(Number.MAX_SAFE_INTEGER)).toBe(MAX_LEVEL);
    });

    it('exactly at level 10 threshold → level 10', () => {
      expect(levelForXp(xpThresholdForLevel(10))).toBe(10);
    });

    it('one XP below level 10 threshold → level 9', () => {
      expect(levelForXp(xpThresholdForLevel(10) - 1)).toBe(9);
    });
  });

  describe('xpToNextLevel', () => {
    it('returns 0 at MAX_LEVEL', () => {
      expect(xpToNextLevel(xpThresholdForLevel(MAX_LEVEL), MAX_LEVEL)).toBe(0);
    });

    it('at level 1 with 0 XP → 100 XP to next', () => {
      expect(xpToNextLevel(0, 1)).toBe(100);
    });

    it('at level 2 with 100 XP → 300 XP to next (L3 = 400)', () => {
      expect(xpToNextLevel(100, 2)).toBe(300);
    });
  });
});

// ---------------------------------------------------------------------------
// RewardsService integration tests (with NestJS DI)
// ---------------------------------------------------------------------------

describe('RewardsService', () => {
  let service: RewardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardsService],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
  });

  // ---- getAllThresholds ----

  describe('getAllThresholds()', () => {
    it('returns exactly MAX_LEVEL entries', () => {
      const { thresholds } = service.getAllThresholds();
      expect(thresholds).toHaveLength(MAX_LEVEL);
    });

    it('first entry is level 1 with 0 XP required', () => {
      const { thresholds } = service.getAllThresholds();
      expect(thresholds[0]).toMatchObject({ level: 1, xpRequired: 0 });
    });

    it('last entry is level MAX_LEVEL', () => {
      const { thresholds } = service.getAllThresholds();
      expect(thresholds[MAX_LEVEL - 1].level).toBe(MAX_LEVEL);
    });

    it('thresholds are monotonically increasing', () => {
      const { thresholds } = service.getAllThresholds();
      for (let i = 1; i < thresholds.length; i++) {
        expect(thresholds[i].xpRequired).toBeGreaterThan(
          thresholds[i - 1].xpRequired,
        );
      }
    });

    it('each entry has a non-empty title string', () => {
      const { thresholds } = service.getAllThresholds();
      for (const t of thresholds) {
        expect(typeof t.title).toBe('string');
        expect(t.title.length).toBeGreaterThan(0);
      }
    });
  });

  // ---- getLevelThreshold ----

  describe('getLevelThreshold(level)', () => {
    it('returns correct data for level 1', () => {
      const result = service.getLevelThreshold(1);
      expect(result).toMatchObject({ level: 1, xpRequired: 0 });
    });

    it('returns correct data for level 10', () => {
      const result = service.getLevelThreshold(10);
      expect(result).toMatchObject({ level: 10, xpRequired: 8100 });
    });

    it('throws NotFoundException for level 0', () => {
      expect(() => service.getLevelThreshold(0)).toThrow(NotFoundException);
    });

    it('throws NotFoundException for level 51', () => {
      expect(() => service.getLevelThreshold(51)).toThrow(NotFoundException);
    });

    it('throws NotFoundException for negative level', () => {
      expect(() => service.getLevelThreshold(-5)).toThrow(NotFoundException);
    });
  });

  // ---- getUserProgression + addXp ----

  describe('getUserProgression(userId)', () => {
    const USER = 'test-user-abc';

    beforeEach(() => {
      // Seed user with 0 XP so the record exists
      service.resetXp(USER);
    });

    it('returns level 1 and correct fields at 0 XP', () => {
      const prog = service.getUserProgression(USER);
      expect(prog).toMatchObject({
        userId: USER,
        xp: 0,
        level: 1,
        xpToNextLevel: 100,
        currentLevelThreshold: 0,
        nextLevelThreshold: 100,
      });
    });

    it('advances to level 2 after exactly 100 XP', () => {
      service.addXp(USER, 100);
      const prog = service.getUserProgression(USER);
      expect(prog.level).toBe(2);
    });

    it('stays at level 1 with 99 XP', () => {
      service.addXp(USER, 99);
      const prog = service.getUserProgression(USER);
      expect(prog.level).toBe(1);
      expect(prog.xpToNextLevel).toBe(1);
    });

    it('correctly computes xpToNextLevel mid-level', () => {
      service.addXp(USER, 250); // between L2 (100) and L3 (400)
      const prog = service.getUserProgression(USER);
      expect(prog.level).toBe(2);
      expect(prog.xpToNextLevel).toBe(400 - 250); // 150
    });

    it('at MAX_LEVEL xpToNextLevel is 0 and nextLevelThreshold is null', () => {
      service.addXp(USER, xpThresholdForLevel(MAX_LEVEL));
      const prog = service.getUserProgression(USER);
      expect(prog.level).toBe(MAX_LEVEL);
      expect(prog.xpToNextLevel).toBe(0);
      expect(prog.nextLevelThreshold).toBeNull();
    });

    it('throws NotFoundException for unknown user', () => {
      expect(() => service.getUserProgression('ghost-user-xyz')).toThrow(
        NotFoundException,
      );
    });
  });

  // ---- addXp guard ----

  describe('addXp()', () => {
    it('throws on zero XP', () => {
      expect(() => service.addXp('u', 0)).toThrow();
    });

    it('throws on negative XP', () => {
      expect(() => service.addXp('u', -10)).toThrow();
    });

    it('creates the user record if it does not exist', () => {
      const prog = service.addXp('brand-new-user', 50);
      expect(prog.xp).toBe(50);
    });
  });
});
