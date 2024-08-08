import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmSignUpDto {
  @IsString()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  validationToken: string;
}
