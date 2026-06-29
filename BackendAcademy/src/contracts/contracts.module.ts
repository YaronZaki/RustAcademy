import { Module } from '@nestjs/common';
import { ContractHealthController } from './contracts.controller';
import { ContractHealthService } from './contracts.service';

@Module({
  controllers: [ContractHealthController],
  providers: [ContractHealthService],
})
export class ContractsModule {}
