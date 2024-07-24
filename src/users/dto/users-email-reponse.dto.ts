import { ApiProperty } from '@nestjs/swagger';
import { UserEmailDto } from './user-email.dto';

export class UsersEmailsResponseDto {
  @ApiProperty({ type: UserEmailDto, isArray: true })
  emails: UserEmailDto[];
}
