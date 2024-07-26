import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDto } from '../users/dto/user.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Allows to register user' })
  @Post('signup')
  @ApiBody({
    description: 'Email and password',
    type: CreateUserDto,
  })
  @ApiCreatedResponse({
    type: UserDto,
  })
  @ApiConflictResponse({
    example: {
      message: 'User already exists',
      error: 'Conflict',
      statusCode: 409,
    },
  })
  @ApiBadRequestResponse({
    example: {
      message: ['password must be longer than or equal to 5 characters'],
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  async registerUser(@Body() userData: CreateUserDto): Promise<UserDto> {
    return this.authService.registerUser(userData);
  }
}
