import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersEmailsResponseDto } from './dto/users-email-reponse.dto';

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
}
