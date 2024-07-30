import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { UsersModule } from '../src/users/users.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { BasicStrategy } from '../src/auth/strategies/basic.strategy';

describe('auth (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
          secret: 'test',
        }),
      ],
      controllers: [AuthController],
      providers: [PrismaService, AuthService, BasicStrategy],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/signup', () => {
    it('/POST signup', async () => {
      jest.spyOn(prismaService.user, 'create').mockResolvedValue({
        id: 'id',
        email: 'email@email.com',
        password: 'password',
        createdAt: new Date(),
      });

      const { status } = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'email@email.com', password: 'password' });

      expect(status).toBe(201);
    });

    it('throws an error if user already exists in database', async () => {
      jest.spyOn(prismaService.user, 'create').mockResolvedValueOnce({
        id: 'id',
        email: 'email@email.com',
        password: 'password',
        createdAt: new Date(),
      });

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'email@email.com', password: 'password' });

      jest.spyOn(prismaService.user, 'create').mockRejectedValue({
        message: 'User already exists',
        error: 'Conflict',
        statusCode: 409,
      });

      const { status } = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'email@email.com', password: 'password' });

      expect(status).toBe(409);
    });

    it('throws an error if user does not provide any credentials', async () => {
      jest.spyOn(prismaService.user, 'create').mockRejectedValue({
        message: [
          'email must be an email',
          'password should not be empty',
          'password must be longer than or equal to 5 characters',
        ],
        error: 'Bad Request',
        statusCode: 400,
      });

      const { status } = await request(app.getHttpServer()).post(
        '/auth/signup',
      );
      expect(status).toBe(400);
    });
  });

  describe('/auth/login', () => {
    it('/POST login', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue({
        id: 'id',
        email: 'user@moodup.team',
        createdAt: new Date(),
      });

      const { status } = await request(app.getHttpServer())
        .post('/auth/login')
        .set({
          Authorization:
            'Basic dXNlckBtb29kdXAudGVhbTpteXN1cGVyc3Ryb25ncGFzc3dvcmQ=',
        });

      expect(status).toBe(200);
    });

    it('should return access token if user is authenticated', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue({
        id: 'id',
        email: 'user@moodup.team',
        createdAt: new Date(),
      });

      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .set({
          Authorization:
            'Basic dXNlckBtb29kdXAudGVhbTpteXN1cGVyc3Ryb25ncGFzc3dvcmQ=',
        });

      expect(body).toEqual({
        access_token: expect.any(String),
      });
    });

    it('should throw an error if user is not authenticated', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      const { status } = await request(app.getHttpServer())
        .post('/auth/login')
        .set({
          Authorization:
            'Basic dXNlckBtb29kdXAudGVhbTpteXN1cGVyc3Ryb25ncGFzc3dvcmQ=',
        });

      expect(status).toBe(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
