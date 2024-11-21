import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('upload file (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return signed upload url and object key', async () => {
    const accessToken = jwtService.sign({
      sub: faker.string.uuid(),
      email: faker.internet.email(),
    });
    const { body } = await request(app.getHttpServer())
      .get('/upload-file')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(body).toEqual({
      uploadUrl: expect.any(String),
      fileKey: expect.any(String),
    });
  });
});
