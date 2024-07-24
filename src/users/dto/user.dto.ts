import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  id: string;

  @IsEmail()
  email: string;

  createdAt: Date;
}
