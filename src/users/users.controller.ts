import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SaveRecipeDto } from './dto/save-recipe.dto';
import { UsersEmailsResponseDto } from './dto/users-email-reponse.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiOperation({ summary: "Get users' emails" })
  @ApiOkResponse({ type: UsersEmailsResponseDto })
  @UseGuards(JwtAuthGuard)
  @Get()
  getEmails(): Promise<UsersEmailsResponseDto> {
    return this.usersService.getEmails();
  }

  @UseGuards(JwtAuthGuard)
  @Put(':userId/saved')
  updateSaved(
    @Body() updateData: SaveRecipeDto,
    @Param('userId') userId: string,
  ) {
    return this.usersService.updateSaved(updateData, userId);
  }
}
