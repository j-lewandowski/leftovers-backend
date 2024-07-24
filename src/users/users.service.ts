import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UsersEmailsResponseDto } from './dto/users-email-reponse.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  getEmails(): Promise<UsersEmailsResponseDto> {
    return this.usersRepository.getEmails();
  }

  registerUser(user: CreateUserDto): Promise<UserDto> {
    const userData = this.usersRepository.register(user);
    return userData;
  }
}
