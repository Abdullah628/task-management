import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Injectable()
export class AuditService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  createLog(
    actorId: string,
    actionType: string,
    before: unknown,
    after: unknown,
    targetTaskId?: string,
  ) {
    if (!targetTaskId) {
      throw new BadRequestException('targetTaskId is required for audit logs');
    }

    return this.prisma.auditLog.create({
      data: {
        actorId,
        actionType,
        targetTaskId,
        dataBefore: before ? (before as object) : undefined,
        dataAfter: after ? (after as object) : undefined,
      },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<unknown>> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
        skip,
        take: safeLimit,
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      data,
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    };
  }
}
