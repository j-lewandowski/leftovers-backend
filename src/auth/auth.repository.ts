import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpRequestDto } from 'src/auth/dto/sign-up-request.dto';

@Injectable()
export class AuthRepository {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async find(token: string): Promise<SignUpRequestDto> {
    return this.prisma.signUpRequests.findFirst({
      where: { validation_token: token },
    });
  }

  async addSignUpRequest(
    token: string,
    email: string,
    password: string,
  ): Promise<SignUpRequestDto> {
    return await this.prisma.signUpRequests.create({
      data: { validation_token: token, email, password },
    });
  }
}
