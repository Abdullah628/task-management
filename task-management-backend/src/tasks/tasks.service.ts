import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatusDto, UpdateTaskDto } from './dto/update-task.dto';
import { AuditService } from '../audit/audit.service';
import { Role } from '../auth/role.enum';

interface Actor {
  userId: string;
  role: Role;
}

const TASK_AUDIT_ACTION = {
  CREATED: 'TASK_CREATED',
  UPDATED: 'TASK_UPDATED',
  DELETED: 'TASK_DELETED',
  STATUS_CHANGED: 'TASK_STATUS_CHANGED',
  ASSIGNMENT_CHANGED: 'TASK_ASSIGNMENT_CHANGED',
} as const;

function mapStatusToPrisma(status?: TaskStatusDto): TaskStatus | undefined {
  if (!status) {
    return undefined;
  }

  return status as TaskStatus;
}

function hasAdminOnlyFields(updateTaskDto: UpdateTaskDto): boolean {
  return updateTaskDto.title !== undefined || updateTaskDto.description !== undefined || updateTaskDto.assignedUserId !== undefined;
}

@Injectable()
export class TasksService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly auditService: AuditService,
  ) {}

  async create(createTaskDto: CreateTaskDto, actor: Actor) {
    if (actor.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can create tasks');
    }

    const assignedUserId = createTaskDto.assignedUserId?.trim() || actor.userId;

    const assignedUser = await this.prisma.user.findUnique({
      where: { id: assignedUserId },
      select: { id: true },
    });

    if (!assignedUser) {
      throw new BadRequestException('Assigned user not found');
    }

    const createdTask = await this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        assignedUserId,
      },
    });

    await this.auditService.createLog(
      actor.userId,
      TASK_AUDIT_ACTION.CREATED,
      null,
      createdTask,
      String(createdTask.id),
    );

    return createdTask;
  }

  findAll(actor: Actor) {
    if (actor.role === Role.ADMIN) {
      return this.prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
    }

    return this.prisma.task.findMany({
      where: { assignedUserId: actor.userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, actor: Actor) {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (actor.role !== Role.ADMIN && task.assignedUserId !== actor.userId) {
      throw new ForbiddenException('You cannot access this task');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, actor: Actor) {
    const before = await this.findOne(id, actor);

    if (actor.role !== Role.ADMIN) {
      if (hasAdminOnlyFields(updateTaskDto)) {
        throw new ForbiddenException('Users can only update task status');
      }

      if (updateTaskDto.status === undefined) {
        throw new BadRequestException('Status is required for user updates');
      }
    }

    if (
      actor.role === Role.ADMIN &&
      updateTaskDto.assignedUserId !== undefined &&
      updateTaskDto.assignedUserId !== before.assignedUserId
    ) {
      const assignedUser = await this.prisma.user.findUnique({
        where: { id: updateTaskDto.assignedUserId },
        select: { id: true },
      });

      if (!assignedUser) {
        throw new BadRequestException('Assigned user not found');
      }
    }

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        status: mapStatusToPrisma(updateTaskDto.status),
        ...(actor.role === Role.ADMIN
          ? {
              title: updateTaskDto.title,
              description: updateTaskDto.description,
              assignedUserId: updateTaskDto.assignedUserId,
            }
          : {}),
      },
    });

    const logsToCreate: Array<Promise<unknown>> = [];
    const hasGeneralTaskChanges =
      before.title !== updatedTask.title ||
      before.description !== updatedTask.description;
    const hasStatusChange = before.status !== updatedTask.status;
    const hasAssignmentChange = before.assignedUserId !== updatedTask.assignedUserId;

    if (hasGeneralTaskChanges) {
      logsToCreate.push(
        this.auditService.createLog(
          actor.userId,
          TASK_AUDIT_ACTION.UPDATED,
          {
            title: before.title,
            description: before.description,
          },
          {
            title: updatedTask.title,
            description: updatedTask.description,
          },
          String(updatedTask.id),
        ),
      );
    }

    if (hasStatusChange) {
      logsToCreate.push(
        this.auditService.createLog(
          actor.userId,
          TASK_AUDIT_ACTION.STATUS_CHANGED,
          { status: before.status },
          {
            status: updatedTask.status,
            changedByRole: actor.role,
          },
          String(updatedTask.id),
        ),
      );
    }

    if (hasAssignmentChange) {
      logsToCreate.push(
        this.auditService.createLog(
          actor.userId,
          TASK_AUDIT_ACTION.ASSIGNMENT_CHANGED,
          { assignedUserId: before.assignedUserId },
          { assignedUserId: updatedTask.assignedUserId },
          String(updatedTask.id),
        ),
      );
    }

    if (logsToCreate.length === 0) {
      logsToCreate.push(
        this.auditService.createLog(
          actor.userId,
          TASK_AUDIT_ACTION.UPDATED,
          before,
          updatedTask,
          String(updatedTask.id),
        ),
      );
    }

    await Promise.all(logsToCreate);

    return updatedTask;
  }

  async remove(id: string, actor: Actor) {
    if (actor.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete tasks');
    }

    const before = await this.findOne(id, actor);

    await this.auditService.createLog(
      actor.userId,
      TASK_AUDIT_ACTION.DELETED,
      before,
      null,
      id,
    );
    await this.prisma.task.delete({ where: { id } });

    return { message: 'Task deleted successfully' };
  }
}
