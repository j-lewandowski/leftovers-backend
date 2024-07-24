import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UsersControler {
  constructor(private usersService: UsersService) {}
  @Post()
  async registerUser(@Body() userData: CreateUserDto): Promise<UserDto> {
    return this.usersService.registerUser(userData);
  }
}
