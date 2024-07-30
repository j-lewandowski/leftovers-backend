import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDto } from '../users/dto/user.dto';
import { AuthService } from './auth.service';
import { BasicAuth } from './basic-auth.guard';
import { AccessTokenDto } from './dto/access-token.dto';

@ApiTags('auth')
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Allows to register a user' })
  @Post('signup')
  @ApiBody({
    description: 'Email and password',
    type: CreateUserDto,
  })
  @ApiCreatedResponse({
    type: UserDto,
    description: 'User has been created',
  })
  @ApiConflictResponse({
    description: 'User with this email already exists.',
    example: {
      message: 'User already exists',
      error: 'Conflict',
      statusCode: 409,
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid credentials.',
    example: {
      message: ['password must be longer than or equal to 5 characters'],
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  async registerUser(@Body() userData: CreateUserDto): Promise<UserDto> {
    return this.authService.registerUser(userData);
  }

  @ApiOperation({ summary: 'Allows to log in a user' })
  @ApiOkResponse({
    description: 'User authorized.',
    type: AccessTokenDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User unauthorized.',
    example: {
      message: 'Unauthorized',
      statusCode: 401,
    },
  })
  @ApiBasicAuth('basic-auth')
  @UseGuards(BasicAuth)
  @Post('login')
  @HttpCode(200)
  async loginUser(@Request() req): Promise<AccessTokenDto> {
    return this.authService.login(req.user);
  }
}
