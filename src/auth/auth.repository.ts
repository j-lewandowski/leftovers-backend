import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpRequestDto } from '../auth/dto/sign-up-request.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthRepository {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async find(email: string): Promise<SignUpRequestDto> {
    return this.prisma.signUpRequests.findFirst({
      where: { email },
    });
  }

  async createSignUpRequest(user: CreateUserDto): Promise<string> {
    const requestsWithTheSameEmail = await this.prisma.signUpRequests.count({
      where: {
        email: user.email,
      },
    });

    if (requestsWithTheSameEmail > 0) {
      throw new ConflictException(
        'Account sign up request for that email already exists.',
      );
    }

    const validation_token = this.jwtService.sign({ email: user.email });
    const password = await bcrypt.hash(
      user.password,
      +this.configService.get('BCRYPT_ROUNDS'),
    );

    await this.prisma.signUpRequests.create({
      data: {
        validation_token,
        email: user.email,
        password,
      },
    });

    return validation_token;
  }
}
