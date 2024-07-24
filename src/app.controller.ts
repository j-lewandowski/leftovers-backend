import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersEmailsResponseDto } from './users/dto/users-email-reponse.dto';

@ApiTags('users')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get users' emails" })
  @ApiOkResponse({ type: UsersEmailsResponseDto })
  getEmails(): Promise<UsersEmailsResponseDto> {
    return this.usersService.getEmails();
  }
}
