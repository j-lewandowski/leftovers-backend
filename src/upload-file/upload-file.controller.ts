import { Body, Controller, Post } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import { GetSignedUrlDto } from './dto/GetSignedUrlDto';

@Controller('upload-file')
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}

  @Post()
  async getSignedUrl(
    @Body() { userId, recipeTitle }: GetSignedUrlDto,
  ): Promise<{ uploadUrl: string }> {
    const url = await this.uploadFileService.getUploadSignedUrl(
      userId,
      recipeTitle,
    );
    return { uploadUrl: url };
  }
}
