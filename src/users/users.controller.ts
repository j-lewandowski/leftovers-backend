import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersEmailsResponseDto } from './dto/users-email-reponse.dto';

@ApiTags('users')
@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}
  @ApiTags()
  @ApiOperation({ summary: "Get users' emails" })
  @ApiOkResponse({ type: UsersEmailsResponseDto })
  @Get()
  getEmails(): Promise<UsersEmailsResponseDto> {
    return this.usersService.getEmails();
  }
}
