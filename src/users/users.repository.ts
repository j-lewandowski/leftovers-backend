import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersEmailsResponseDto } from './dto/users-email-reponse.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async getEmails(): Promise<UsersEmailsResponseDto> {
    const emails = await this.prisma.user.findMany({
      select: {
        email: true,
      },
    });
    return { emails };
  }

  async register(user: CreateUserDto): Promise<UserDto> {
    const res = await this.prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
      },
    });
    delete res.password;
    return res;
  }
}
