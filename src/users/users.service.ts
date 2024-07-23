import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async getEmails() {
    const users = await this.usersRepository.getEmails();
    return users;
  }
}
