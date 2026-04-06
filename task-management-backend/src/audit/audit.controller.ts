import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(@Inject(AuditService) private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.auditService.findAll();
  }
}
