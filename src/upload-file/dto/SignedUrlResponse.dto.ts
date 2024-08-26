import { ApiProperty } from '@nestjs/swagger';

export class SignedUrlResponseDto {
  @ApiProperty({ type: String })
  uploadUrl: string;
  @ApiProperty({ example: '/recipes/userid/recipe/timestamp' })
  fileKey: string;
}
