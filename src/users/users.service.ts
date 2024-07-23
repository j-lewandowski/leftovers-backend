import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  getEmails(): Promise<{ email: string }[]> {
    const users = this.usersRepository.getEmails();
    return users;
  }
}
