import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDto } from '../users/dto/user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenDto } from './dto/access-token.dto';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private authRepository: AuthRepository,
  ) {}

  registerUser(user: CreateUserDto): Promise<UserDto> {
    const userData = this.usersRepository.register(user);
    return userData;
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

  async addSignUpRequest(user: CreateUserDto): Promise<string> {
    const validation_token = this.jwtService.sign({ email: user.email });
    const password = await bcrypt.hash(
      user.password,
      +this.configService.get('BCRYPT_ROUNDS'),
    );
    await this.authRepository.addSignUpRequest(
      validation_token,
      user.email,
      password,
    );
    return validation_token;
  }

  async confirmUserRegistration(user: {
    validation_token: string;
    email: string;
  }): Promise<void> {
    const userRequest = await this.authRepository.find(user.validation_token);
    if (!userRequest) {
      return null;
    }

    if (!this.jwtService.verify(user.validation_token)) {
      return null;
    }

    await this.usersRepository.register({
      email: userRequest.email,
      password: userRequest.password,
    });
  }
}
