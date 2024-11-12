import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { UploadFileController } from '../src/upload-file/upload-file.controller';
import { UploadFileService } from '../src/upload-file/upload-file.service';

describe('upload file (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        ConfigModule.forRoot({
          envFilePath: '.env.test.local',
          isGlobal: true,
        }),
        JwtModule.registerAsync({
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET'),
            signOptions: {
              expiresIn: '24h',
            },
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [UploadFileService, JwtStrategy],
      controllers: [UploadFileController],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();
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
