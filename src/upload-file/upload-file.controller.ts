import { Body, Controller, Get } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetSignedUrlDto } from './dto/GetSignedUrl.dto';
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
  @ApiBody({
    description:
      'User id and recipe title will be used to generate object key that can be used to obtain the image later.',
    type: GetSignedUrlDto,
  })
  @ApiOkResponse({
    description: 'Upload url and file key to access the file later.',
    type: SignedUrlResponseDto,
  })
  @Get()
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
