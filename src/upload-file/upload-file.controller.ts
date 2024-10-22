import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenUserDataDto } from '../auth/dto/access-token-user-data.dto';
import { GetUser } from '../auth/getUser.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SignedUrlResponseDto } from './dto/SignedUrlResponse.dto';
import { UploadFileService } from './upload-file.service';

@Controller('upload-file')
@ApiTags('upload file')
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}

  @ApiOperation({
    summary:
      'Allows to generate signed up url that can be used to upload images to AWS S3.',
  })
  @ApiOkResponse({
    description: 'Upload url and file key to access the file later.',
    type: SignedUrlResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getSignedUrl(
    @GetUser() { userId }: AccessTokenUserDataDto,
  ): Promise<SignedUrlResponseDto> {
    const uploadData = await this.uploadFileService.getUploadSignedUrl(userId);
    return { ...uploadData };
  }
}
