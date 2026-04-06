import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export enum TaskStatusDto {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatusDto)
  status?: TaskStatusDto;

  @IsOptional()
  @IsUUID()
  assignedUserId?: string;
}
