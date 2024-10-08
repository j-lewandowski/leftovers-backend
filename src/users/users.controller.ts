import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenUserDataDto } from '../auth/dto/access-token-user-data.dto';
import { GetUser } from '../auth/getUser.decorator';
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

  @ApiOperation({
    summary: 'Allows to add or remove recipe to favourite recipes.',
  })
  @ApiOkResponse({
    description: 'Recipe saved/removed from saved recipes successfully.',
  })
  @UseGuards(JwtAuthGuard)
  @Put('/save-recipes')
  updateSavedRecipes(
    @Body() updateData: SaveRecipeDto,
    @GetUser() user: AccessTokenUserDataDto,
  ): Promise<void> {
    return this.usersService.updateSavedRecipes(updateData, user.userId);
  }
}
