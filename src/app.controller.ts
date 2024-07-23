import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get users' emails" })
  @ApiResponse({
    status: 200,
    example: [
      {
        email: 'email1@email.com',
      },
      {
        email: 'email2@email.com',
      },
      {
        email: 'email3@email.com',
      },
    ],
  })
  async getUsers() {
    return await this.usersService.getEmails();
  }
}
