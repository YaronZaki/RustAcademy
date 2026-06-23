"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SorobanDomainException = void 0;
const common_1 = require("@nestjs/common");
const soroban_error_codes_1 = require("../soroban-errors/soroban-error.codes");

/** Maps stable domain error codes to appropriate HTTP status codes. */
const HTTP_STATUS_MAP = {
    [soroban_error_codes_1.SorobanErrorCode.UNAUTHORIZED]: common_1.HttpStatus.FORBIDDEN,
    [soroban_error_codes_1.SorobanErrorCode.AUTH_MISSING]: common_1.HttpStatus.UNAUTHORIZED,
    [soroban_error_codes_1.SorobanErrorCode.NOT_FOUND]: common_1.HttpStatus.NOT_FOUND,
    [soroban_error_codes_1.SorobanErrorCode.ESCROW_NOT_FOUND]: common_1.HttpStatus.NOT_FOUND,
    [soroban_error_codes_1.SorobanErrorCode.CONTRACT_PAUSED]: common_1.HttpStatus.SERVICE_UNAVAILABLE,
    [soroban_error_codes_1.SorobanErrorCode.CONTRACT_WRITES_DISABLED]: common_1.HttpStatus.SERVICE_UNAVAILABLE,
    [soroban_error_codes_1.SorobanErrorCode.INDEXER_LAGGING]: common_1.HttpStatus.SERVICE_UNAVAILABLE,
    [soroban_error_codes_1.SorobanErrorCode.RESTORE_REQUIRED]: common_1.HttpStatus.CONFLICT,
    [soroban_error_codes_1.SorobanErrorCode.ESCROW_ALREADY_SETTLED]: common_1.HttpStatus.CONFLICT,
    [soroban_error_codes_1.SorobanErrorCode.REFUND_DUPLICATE]: common_1.HttpStatus.CONFLICT,
    [soroban_error_codes_1.SorobanErrorCode.BUDGET_EXCEEDED]: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
    [soroban_error_codes_1.SorobanErrorCode.INVALID_INPUT]: common_1.HttpStatus.BAD_REQUEST,
    [soroban_error_codes_1.SorobanErrorCode.INVALID_AMOUNT]: common_1.HttpStatus.BAD_REQUEST,
    [soroban_error_codes_1.SorobanErrorCode.INVALID_ADMIN]: common_1.HttpStatus.BAD_REQUEST,
    [soroban_error_codes_1.SorobanErrorCode.INVALID_WASM_HASH]: common_1.HttpStatus.BAD_REQUEST,
    [soroban_error_codes_1.SorobanErrorCode.INSUFFICIENT_BALANCE]: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
    [soroban_error_codes_1.SorobanErrorCode.VERSION_MISMATCH]: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
};

class SorobanDomainException extends common_1.HttpException {
    constructor(mapped) {
        const status = HTTP_STATUS_MAP[mapped.code] ?? common_1.HttpStatus.UNPROCESSABLE_ENTITY;
        super(
            Object.assign(
                { code: mapped.code, message: mapped.message },
                mapped.details ? { details: mapped.details } : {}
            ),
            status
        );
        this.domainCode = mapped.code;
        this.technicalError = mapped.technicalError;
        this.details = mapped.details;
    }
}
exports.SorobanDomainException = SorobanDomainException;
