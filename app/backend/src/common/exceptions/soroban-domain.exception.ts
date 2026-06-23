import { HttpException, HttpStatus } from '@nestjs/common';
import type { MappedSorobanError } from '../soroban-errors';
import { SorobanErrorCode } from '../soroban-errors';

/** Maps stable domain error codes to appropriate HTTP status codes. */
const HTTP_STATUS_MAP: Partial<Record<SorobanErrorCode, HttpStatus>> = {
  [SorobanErrorCode.UNAUTHORIZED]: HttpStatus.FORBIDDEN,
  [SorobanErrorCode.AUTH_MISSING]: HttpStatus.UNAUTHORIZED,
  [SorobanErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [SorobanErrorCode.ESCROW_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [SorobanErrorCode.CONTRACT_PAUSED]: HttpStatus.SERVICE_UNAVAILABLE,
  [SorobanErrorCode.CONTRACT_WRITES_DISABLED]: HttpStatus.SERVICE_UNAVAILABLE,
  [SorobanErrorCode.INDEXER_LAGGING]: HttpStatus.SERVICE_UNAVAILABLE,
  [SorobanErrorCode.RESTORE_REQUIRED]: HttpStatus.CONFLICT,
  [SorobanErrorCode.ESCROW_ALREADY_SETTLED]: HttpStatus.CONFLICT,
  [SorobanErrorCode.REFUND_DUPLICATE]: HttpStatus.CONFLICT,
  [SorobanErrorCode.BUDGET_EXCEEDED]: HttpStatus.UNPROCESSABLE_ENTITY,
  [SorobanErrorCode.INVALID_INPUT]: HttpStatus.BAD_REQUEST,
  [SorobanErrorCode.INVALID_AMOUNT]: HttpStatus.BAD_REQUEST,
  [SorobanErrorCode.INVALID_ADMIN]: HttpStatus.BAD_REQUEST,
  [SorobanErrorCode.INVALID_WASM_HASH]: HttpStatus.BAD_REQUEST,
  [SorobanErrorCode.INSUFFICIENT_BALANCE]: HttpStatus.UNPROCESSABLE_ENTITY,
  [SorobanErrorCode.VERSION_MISMATCH]: HttpStatus.UNPROCESSABLE_ENTITY,
};

/**
 * Typed domain exception for Soroban contract errors.
 *
 * Wraps a {@link MappedSorobanError} and exposes a stable `code` and `message`
 * suitable for API responses. The raw `technicalError` from the mapper is held
 * internally for server-side logging only and is never included in the HTTP body.
 */
export class SorobanDomainException extends HttpException {
  readonly domainCode: SorobanErrorCode;
  /** Raw Soroban error — for server-side logging only, never sent to clients. */
  readonly technicalError: string;
  readonly details?: Record<string, unknown>;

  constructor(mapped: MappedSorobanError) {
    const status =
      HTTP_STATUS_MAP[mapped.code] ?? HttpStatus.UNPROCESSABLE_ENTITY;

    super(
      {
        code: mapped.code,
        message: mapped.message,
        ...(mapped.details ? { details: mapped.details } : {}),
      },
      status,
    );

    this.domainCode = mapped.code;
    this.technicalError = mapped.technicalError;
    this.details = mapped.details;
  }
}
