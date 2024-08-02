import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpRequestDto } from '../auth/dto/sign-up-request.dto';
import { CreateSignUpRequestDto } from './dto/create-sign-up-request.dto';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async find(email: string): Promise<SignUpRequestDto> {
    return this.prisma.signUpRequests.findFirst({
      where: { email },
    });
  }

  async countRequestsWithTheSameEmail(email: string): Promise<number> {
    return this.prisma.signUpRequests.count({
      where: {
        email,
      },
    });
  }

  async createSignUpRequest(user: CreateSignUpRequestDto): Promise<void> {
    await this.prisma.signUpRequests.create({
      data: user,
    });
  }
}
