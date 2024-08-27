import { Test, TestingModule } from '@nestjs/testing';
import { UploadFileService } from './upload-file.service';
import { ConfigService } from '@nestjs/config';
import { faker } from '@faker-js/faker';
import * as presigner from '@aws-sdk/s3-request-presigner';
jest.mock('@aws-sdk/s3-request-presigner');

describe('UploadFileService', () => {
  let service: UploadFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadFileService, ConfigService],
    }).compile();

    service = module.get<UploadFileService>(UploadFileService);
  });

  describe('getUploadSignedUrl', () => {
    it('should return signed url and file key', async () => {
      // given
      const mockGetSignedUrl = jest.fn().mockResolvedValue('test');
      (presigner.getSignedUrl as jest.Mock) = mockGetSignedUrl;

      // when
      const res = await service.getUploadSignedUrl(
        faker.string.uuid(),
        faker.commerce.product(),
      );

      // then
      expect(res).toEqual({
        uploadUrl: expect.any(String),
        fileKey: expect.any(String),
      });
    });
  });
});
