import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(6)
  currentPassword!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
