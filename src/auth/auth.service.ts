import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDto } from '../users/dto/user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenDto } from './dto/access-token.dto';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import { ConfirmSignUpDto } from './dto/confirm-sign-up.dto';
@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private authRepository: AuthRepository,
  ) {}

  registerUser(user: CreateUserDto): Promise<UserDto> {
    return this.usersRepository.register(user);
  }

  async validateUser(email: string, password: string): Promise<UserDto> {
    const user = await this.usersRepository.findOne(email);
    if (!user) {
      return null;
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      return null;
    }

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(user: UserDto): Promise<AccessTokenDto> {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createSignUpRequest(user: CreateUserDto): Promise<string> {
    return await this.authRepository.createSignUpRequest(user);
  }

  async confirmUserRegistration(requestData: ConfirmSignUpDto): Promise<void> {
    const userRequest = await this.authRepository.find(requestData.email);
    if (!userRequest) {
      throw new NotFoundException('Request not found.');
    }

    if (requestData.validation_token !== userRequest.validation_token) {
      throw new UnauthorizedException('Invalid token');
    }

    await this.usersRepository.register({
      email: userRequest.email,
      password: userRequest.password,
    });
  }
}
