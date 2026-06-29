import { Controller, Get } from '@nestjs/common';
import { ContractHealthService } from './contracts.service';

@Controller('contracts')
export class ContractHealthController {
  constructor(private readonly contractHealthService: ContractHealthService) {}

  @Get('health')
  async checkHealth() {
    return this.contractHealthService.check();
  }
}
