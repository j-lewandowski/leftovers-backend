import { Module } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import { UploadFileController } from './upload-file.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [UploadFileController],
  providers: [UploadFileService],
  imports: [ConfigModule],
})
export class UploadFileModule {}
