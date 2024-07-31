import { PrismaModule } from '../src/prisma/prisma.module';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { EmailService } from '../src/email/email.service';
import { AuthRepository } from '../src/auth/auth.repository';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UsersModule } from '../src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../src/email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from '../src/auth/auth.controller';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { BasicStrategy } from '../src/auth/strategies/basic.strategy';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

describe('auth (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        UsersModule,
        PassportModule,
        EmailModule,
        ConfigModule.forRoot({
          envFilePath: '.env.test.local',
          isGlobal: true,
        }),
        PrismaModule,
        JwtModule.register({
          secret: 'test-secret',
        }),
      ],
      controllers: [AuthController],
      providers: [
        PrismaService,
        AuthService,
        BasicStrategy,
        JwtStrategy,
        EmailService,
        ConfigService,
        AuthRepository,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
    await prismaService.signUpRequests.deleteMany();
  });

  describe('/auth/signup', () => {
    it('/POST signup', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'email@email.com', password: 'password' });

      expect(status).toBe(201);
    });

    it('throws an error if user already exists in database', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'email@email.com', password: 'password' });

      const { status } = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'email@email.com', password: 'password' });

      expect(status).toBe(409);
    });

    it('throws an error if user does not provide any credentials', async () => {
      const { status } = await request(app.getHttpServer()).post(
        '/auth/signup',
      );
      expect(status).toBe(400);
    });
  });

  describe('/auth/login', () => {
    it('/POST login', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const hashedPassword = await bcrypt.hash(password, 10);
      await prismaService.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });
      const data = btoa(`${email}:${password}`);
      const { status } = await request(app.getHttpServer())
        .post('/auth/login')
        .set({
          Authorization: `Basic ${data}`,
        });

      expect(status).toBe(200);
    });

    it('should return access token if user is authenticated', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const hashedPassword = await bcrypt.hash(password, 10);
      await prismaService.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });
      const data = btoa(`${email}:${password}`);
      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .set({
          Authorization: `Basic ${data}`,
        });
      expect(body).toEqual({
        access_token: expect.any(String),
      });
    });

    it('should throw an error if user is not authenticated', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/auth/login')
        .set({
          Authorization:
            'Basic dXNlckBtb29kdXAudGVhbTpteXN1cGVyc3Ryb25ncGFzc3dvcmQ=',
        });

      expect(status).toBe(401);
    });
  });

  describe('/auth/register', () => {
    it('/POST register', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const { status } = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password });
      expect(status).toBe(201);
    });

    it('should throw an error if user does not provide any data', async () => {
      const { status } = await request(app.getHttpServer()).post(
        '/auth/register',
      );

      expect(status).toBe(400);
    });
  });

  describe('/auth/confirm', () => {
    it('/POST confirm', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const hashedPassword = await bcrypt.hash(password, 10);
      const validation_token = jwtService.sign({ email });
      await prismaService.signUpRequests.create({
        data: { email, password: hashedPassword, validation_token },
      });
      const { status } = await request(app.getHttpServer())
        .post('/auth/confirm')
        .send({ email, validation_token });
      expect(status).toBe(201);
    });

    it('should throw an error if user does not provide any data', async () => {
      const { status } = await request(app.getHttpServer()).post(
        '/auth/register',
      );

      expect(status).toBe(400);
    });

    it('should throw an error if user already created signup request', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const hashedPassword = await bcrypt.hash(password, 10);
      const validation_token = jwtService.sign({ email });
      await prismaService.signUpRequests.create({
        data: { email, password: hashedPassword, validation_token },
      });
      await request(app.getHttpServer())
        .post('/auth/confirm')
        .send({ email, validation_token });
      const { status } = await request(app.getHttpServer())
        .post('/auth/confirm')
        .send({ email, validation_token });
      expect(status).toBe(409);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
