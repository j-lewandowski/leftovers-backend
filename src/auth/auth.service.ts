import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDto } from '../users/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(private usersRepository: UsersRepository) {}

  registerUser(user: CreateUserDto): Promise<UserDto> {
    const userData = this.usersRepository.register(user);
    return userData;
  }
}
