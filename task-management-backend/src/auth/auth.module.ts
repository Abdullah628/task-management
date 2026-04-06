import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
	imports: [
		ConfigModule,
		PassportModule,
		UsersModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '1d');

				return {
					secret: configService.get<string>('JWT_SECRET', 'dev-secret'),
					signOptions: {
						expiresIn: expiresIn as JwtSignOptions['expiresIn'],
					},
				};
			},
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}
