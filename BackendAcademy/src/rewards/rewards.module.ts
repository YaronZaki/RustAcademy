import { Module } from '@nestjs/common';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';

/**
 * RewardsModule
 *
 * Self-contained feature module for the XP/level/progression system.
 * Import this module in AppModule to enable the /rewards/* endpoints.
 */
@Module({
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
