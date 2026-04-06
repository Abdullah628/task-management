import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  controllers: [TasksController],
  providers: [TasksService, PrismaService, AuditService, RolesGuard],
})
export class TasksModule {}
