import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { Role } from './role.enum';

@Injectable()
export class AuthService {
	constructor(
		@Inject(UsersService) private readonly usersService: UsersService,
		@Inject(JwtService) private readonly jwtService: JwtService,
	) {}

	async login(email: string, password: string) {
		const user = await this.usersService.findByEmail(email);

		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const payload: { sub: string; email: string; role: Role } = {
			sub: String(user.id),
			email: user.email,
			role: user.role as Role,
		};

		const accessToken = await this.jwtService.signAsync(payload);

		return {
			accessToken,
		};
	}
}
