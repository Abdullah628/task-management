import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  controllers: [AuditController],
  providers: [AuditService, PrismaService, RolesGuard],
  exports: [AuditService],
})
export class AuditModule {}
