import { ERROR_CODES, type ErrorCode } from '@wanderprint/shared';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} bulunamadı: ${id}` : `${resource} bulunamadı`;
    const code = `${resource.toUpperCase()}_NOT_FOUND` as ErrorCode;
    super(message, 404, code);
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, unknown>) {
    super('Doğrulama hatası', 422, ERROR_CODES.VALIDATION_ERROR, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Kimlik doğrulaması gerekli') {
    super(message, 401, ERROR_CODES.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Bu işlem için yetkiniz yok') {
    super(message, 403, ERROR_CODES.FORBIDDEN);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCode) {
    super(message, 409, code);
  }
}
