import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  async getUploadSignedUrl(userId: string): Promise<SignedUrlResponseDto> {
    const timestamp = Date.now();
    const fileKey = `recipes/${userId}/${timestamp}`;
    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: fileKey,
    });

    const uploadUrl = await getSignedUrl(this.s3client, command, {
      expiresIn: 3600, // 1 hour
    });

    return { uploadUrl, fileKey };
  }

  async getImageUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: key,
    });
    return await getSignedUrl(this.s3client, command, {
      expiresIn: 3600, // 1 hour
    });
  }
}
