import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private usersService: UsersService) {}
  @Post('signup')
  async registerUser(@Body() userData: CreateUserDto): Promise<UserDto> {
    return this.usersService.registerUser(userData);
  }
}
