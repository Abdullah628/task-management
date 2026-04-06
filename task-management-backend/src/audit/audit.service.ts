import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  findAll() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        targetTask: true,
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
}
