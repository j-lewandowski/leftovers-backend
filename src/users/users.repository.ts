import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async getEmails(): Promise<{ email: string }[]> {
    const emails = await this.prisma.user.findMany({
      select: {
        email: true,
      },
    });
    return emails;
  }
}
