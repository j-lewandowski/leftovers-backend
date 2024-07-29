import { Injectable } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { UsersEmailsResponseDto } from './dto/users-email-reponse.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  getEmails(): Promise<UsersEmailsResponseDto> {
    return this.usersRepository.getEmails();
  }
}
