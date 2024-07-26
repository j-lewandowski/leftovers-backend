import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDto } from '../users/dto/user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
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

    delete user.password;
    return user;
  }

  async login(user: UserDto): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
