import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SignedUrlResponseDto } from './dto/SignedUrlResponse.dto';

@Injectable()
export class UploadFileService {
  private s3client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3client = new S3Client({
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
      },
      region: this.configService.get('AWS_BUCKET_REGION'),
    });
  }

  async getUploadSignedUrl(
    userId: string,
    recipeTitle: string,
  ): Promise<SignedUrlResponseDto> {
    const timestamp = Date.now();
    const fileKey = `recipes/${userId}/${recipeTitle}/${timestamp}`;
    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: fileKey,
      ACL: 'public-read',
    });

    const uploadUrl = await getSignedUrl(this.s3client, command, {
      expiresIn: 3600, // 1 hour
    });

    return { uploadUrl, fileKey };
  }
}
