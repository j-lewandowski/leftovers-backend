import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpRequestDto } from 'src/auth/dto/sign-up-request.dto';

@Injectable()
export class SignUpRequestsRepository {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(token: string, password: string): Promise<SignUpRequestDto> {
    return await this.prisma.signUpRequests.create({
      data: { validation_token: token, password },
    });
  }
}
