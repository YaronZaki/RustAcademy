import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContractHealthService {
  private readonly logger = new Logger(ContractHealthService.name);
  private readonly sorobanUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.sorobanUrl =
      this.configService.get<string>('SOROBAN_RPC_URL') ??
      this.configService.get<string>('stellar.sorobanRpcUrl') ??
      'https://soroban-testnet.stellar.org';
    this.timeoutMs = Number(
      this.configService.get<string>('SOROBAN_RPC_TIMEOUT_MS') ?? 5_000,
    );
  }

  async check(): Promise<{
    status: 'ok' | 'unhealthy';
    details: {
      sorobanRpc: {
        status: 'up' | 'down';
        url: string;
        latencyMs?: number;
        error?: string;
      };
    };
  }> {
    const result = await this.checkSorobanRpc();
    return {
      status: result.status === 'up' ? 'ok' : 'unhealthy',
      details: {
        sorobanRpc: result,
      },
    };
  }

  private async checkSorobanRpc(): Promise<{
    status: 'up' | 'down';
    url: string;
    latencyMs?: number;
    error?: string;
  }> {
    const start = Date.now();
    const url = this.sorobanUrl;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Soroban RPC timeout')), this.timeoutMs),
    );

    try {
      const response = await Promise.race([
        fetch(url, { method: 'GET' }),
        timeoutPromise,
      ]);

      if (!response.ok) {
        throw new Error(`Unexpected HTTP status ${response.status}`);
      }

      const latencyMs = Date.now() - start;
      return { status: 'up', url, latencyMs };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('unknown error');
      const message = err.message ?? 'unknown error';
      this.logger.warn(`Soroban RPC health failed: ${message}`);
      return { status: 'down', url, error: message };
    }
  }
}
