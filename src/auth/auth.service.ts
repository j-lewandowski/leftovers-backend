import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/repositories/users.repository';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDto } from '../users/dto/user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenDto } from './dto/access-token.dto';
import { ConfigService } from '@nestjs/config';
import { SignUpRequestsRepository } from './auth.repository';
@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private signUpRequestsRepository: SignUpRequestsRepository,
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
    await this.signUpRequestsRepository.create(validation_token, password);
    return validation_token;
  }
}
