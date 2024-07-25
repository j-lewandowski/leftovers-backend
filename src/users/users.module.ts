import { Module } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [UsersRepository, UsersService],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
