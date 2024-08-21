import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UploadFileController } from '../src/upload-file/upload-file.controller';
import { UploadFileService } from '../src/upload-file/upload-file.service';
import { faker } from '@faker-js/faker';
import * as request from 'supertest';

describe('upload file (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test.local',
          isGlobal: true,
        }),
      ],
      providers: [UploadFileService],
      controllers: [UploadFileController],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it('should return signed upload url and object key', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/upload-file')
      .send({
        userId: faker.string.uuid(),
        recipeTitle: faker.commerce.product(),
      });

    expect(body).toEqual({
      uploadUrl: expect.any(String),
      fileKey: expect.any(String),
    });
  });
});
