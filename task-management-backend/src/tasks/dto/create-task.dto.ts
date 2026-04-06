import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  assignedUserId?: string;
}
