import { Module } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersControler } from './users.controller';

@Module({
  imports: [PrismaModule],
  providers: [UsersRepository, UsersService],
  controllers: [UsersControler],
  exports: [UsersService],
})
export class UsersModule {}
