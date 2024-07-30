import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from './strategies/basic.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' },
    }),
    EmailModule,
    ConfigModule,
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    BasicStrategy,
    JwtStrategy,
    EmailService,
    AuthRepository,
    ConfigService,
  ],
})
export class AuthModule {}
