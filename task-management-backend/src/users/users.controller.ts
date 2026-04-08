import { Body, Controller, Get, Inject, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthenticatedRequest } from '../common/types/authenticated-request.type';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Patch('me')
  updateMe(@Req() req: AuthenticatedRequest, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto.name);
  }

  @Patch('me/password')
  changeMyPassword(@Req() req: AuthenticatedRequest, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(
      req.user.userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }
}