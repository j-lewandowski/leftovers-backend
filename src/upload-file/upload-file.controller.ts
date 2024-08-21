import { Body, Controller, Post } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import { GetSignedUrlDto } from './dto/GetSignedUrl.dto';
import { SignedUrlResponseDto } from './dto/SignedUrlResponse.dto';

@Controller('upload-file')
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}

  @Post()
  async getSignedUrl(
    @Body() { userId, recipeTitle }: GetSignedUrlDto,
  ): Promise<SignedUrlResponseDto> {
    const uploadData = await this.uploadFileService.getUploadSignedUrl(
      userId,
      recipeTitle,
    );
    return { ...uploadData };
  }
}
