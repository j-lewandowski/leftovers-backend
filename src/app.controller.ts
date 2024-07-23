import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private usersService: UsersService,
  ) {}

  @Get()
  getEmails(): Promise<{ email: string }[]> {
    return this.usersService.getEmails();
  }
}
