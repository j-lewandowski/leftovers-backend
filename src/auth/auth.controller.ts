import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
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
import { EmailService } from '../email/email.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { AccessTokenDto } from './dto/access-token.dto';
import { ConfirmSignUpDto } from './dto/confirm-sign-up.dto';
import { CreateResetPasswordRequestDto } from './dto/create-reset-password-request.dto';
import { MessageDto } from './dto/message.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GetUser } from './getUser.decorator';
import { BasicAuthGuard } from './guards/basic-auth.guard';

@ApiTags('auth')
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({
    summary: 'Allows to register a user',
    deprecated: true,
  })
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

  @ApiOperation({
    summary:
      'Allows to register a user and sends confirmation email to provided email address',
  })
  @ApiBody({
    description: 'Email and password',
    type: CreateUserDto,
  })
  @ApiCreatedResponse({
    description: 'User request has been created.',
  })
  @ApiConflictResponse({
    description: 'Sign up request with this email already exists.',
    example: {
      message: 'Request already exists',
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
  @Post('/register')
  async signUpUser(@Body() userData: CreateUserDto): Promise<void> {
    await this.authService.createSignUpRequest(userData);
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
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginUser(@GetUser() user: UserDto): Promise<AccessTokenDto> {
    return this.authService.login(user);
  }

  @Post('/confirm')
  @ApiOperation({ summary: 'Allows to confirm users sign up request.' })
  @ApiCreatedResponse({
    description: 'Account created.',
  })
  @ApiConflictResponse({
    description:
      'There is already a sign up request connected to this email in database.',
    example: {
      message: 'User already exists',
      statusCode: 409,
    },
  })
  async confirmUserRegistration(
    @Body() confirmSignUpDto: ConfirmSignUpDto,
  ): Promise<void> {
    await this.authService.confirmUserRegistration(confirmSignUpDto);
  }

  @ApiOperation({
    summary: 'Creates password reset request',
  })
  @ApiOkResponse({
    type: MessageDto,
    example: {
      message:
        'Thanks! An e-mail was sent that will ask you to click on a link to verify that you own this account 📬',
    },
  })
  @Post('/forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  async createResetPasswordRequest(
    @Body() createResetPasswordRequestDto: CreateResetPasswordRequestDto,
  ): Promise<void> {
    await this.authService.createResetPasswordRequest(
      createResetPasswordRequestDto.email,
    );
  }

  @ApiOperation({
    summary: "Resets users' password.",
  })
  @ApiOkResponse({
    description: 'Password has been updated.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Either validation token is invalid or password reset request does not exist.',
  })
  @Post('/reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    await this.authService.resetPassword(resetPasswordDto);
  }
}
