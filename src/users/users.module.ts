import { Module } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [UsersRepository, UsersService],
  exports: [UsersService, UsersRepository],
  controllers: [UsersController],
})
export class UsersModule {}
