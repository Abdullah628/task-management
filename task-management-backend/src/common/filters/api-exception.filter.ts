import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

type ErrorBody = {
  statusCode: number;
  message: string;
  errors?: string[];
  timestamp: string;
  path: string;
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const errorBody = this.mapException(exception, request.url);
    response.status(errorBody.statusCode).json(errorBody);
  }

  private mapException(exception: unknown, path: string): ErrorBody {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.mapPrismaKnownRequestError(exception, path);
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database connection is not available. Please try again later.',
        timestamp: new Date().toISOString(),
        path,
      };
    }

    if (exception instanceof HttpException) {
      return this.mapHttpException(exception, path);
    }

    this.logger.error('Unhandled exception', exception as Error);
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong while processing your request.',
      timestamp: new Date().toISOString(),
      path,
    };
  }

  private mapHttpException(exception: HttpException, path: string): ErrorBody {
    const status = exception.getStatus();
    const response = exception.getResponse();

    if (exception instanceof BadRequestException && typeof response === 'object' && response !== null) {
      const payload = response as { message?: string | string[] };
      const validationMessages = Array.isArray(payload.message)
        ? payload.message
        : payload.message
          ? [payload.message]
          : ['Invalid request payload'];

      return {
        statusCode: status,
        message: 'Validation failed',
        errors: validationMessages,
        timestamp: new Date().toISOString(),
        path,
      };
    }

    if (typeof response === 'string') {
      return {
        statusCode: status,
        message: response,
        timestamp: new Date().toISOString(),
        path,
      };
    }

    if (typeof response === 'object' && response !== null) {
      const payload = response as { message?: string | string[] };
      const normalizedMessage = Array.isArray(payload.message)
        ? payload.message.join(', ')
        : payload.message || exception.message;

      return {
        statusCode: status,
        message: normalizedMessage,
        timestamp: new Date().toISOString(),
        path,
      };
    }

    return {
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  private mapPrismaKnownRequestError(
    exception: Prisma.PrismaClientKnownRequestError,
    path: string,
  ): ErrorBody {
    const prismaCodeMap: Record<string, { statusCode: number; message: string }> = {
      P2002: {
        statusCode: HttpStatus.CONFLICT,
        message: 'A record with the same unique value already exists.',
      },
      P2003: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Related record was not found. Please check referenced IDs.',
      },
      P2025: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Requested record was not found.',
      },
    };

    const mapped = prismaCodeMap[exception.code] || {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Database request failed. Please check your input and try again.',
    };

    return {
      statusCode: mapped.statusCode,
      message: mapped.message,
      timestamp: new Date().toISOString(),
      path,
    };
  }
}