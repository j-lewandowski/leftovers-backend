import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersEmailsResponseDto } from './dto/users-email-reponse.dto';
<<<<<<< HEAD
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
=======
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
>>>>>>> 4d760c8 (feat: added access token authentication)

@ApiTags('users')
@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}
  @ApiTags()
  @ApiOperation({ summary: "Get users' emails" })
  @ApiOkResponse({ type: UsersEmailsResponseDto })
  @UseGuards(JwtAuthGuard)
  @Get()
  getEmails(): Promise<UsersEmailsResponseDto> {
    return this.usersService.getEmails();
  }
}
