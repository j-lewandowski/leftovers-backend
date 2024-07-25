import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersEmailsResponseDto } from './dto/users-email-reponse.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersRepository {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getEmails(): Promise<UsersEmailsResponseDto> {
    const emails = await this.prisma.user.findMany({
      select: {
        email: true,
      },
    });
    return { emails };
  }

  async register(user: CreateUserDto): Promise<UserDto> {
    const usersWithTheSameEmail = await this.prisma.user.count({
      where: {
        email: user.email,
      },
    });

    if (usersWithTheSameEmail > 0)
      throw new ConflictException('User already exists');

    const hashedPassword = await bcrypt.hash(
      user.password,
      +this.configService.get('BCRYPT_ROUNDS'),
    );

    const res = await this.prisma.user.create({
      data: {
        email: user.email,
        password: hashedPassword,
      },
    });
    delete res.password;
    return res;
  }
}
