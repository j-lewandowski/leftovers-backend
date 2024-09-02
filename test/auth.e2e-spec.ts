import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthRepository } from '../src/auth/auth.repository';
import { AuthService } from '../src/auth/auth.service';
import { BasicStrategy } from '../src/auth/strategies/basic.strategy';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { EmailModule } from '../src/email/email.module';
import { EmailService } from '../src/email/email.service';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsersModule } from '../src/users/users.module';

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
          secret: 'VERYSECRETKEYTEST',
          signOptions: {
            expiresIn: '24h',
          },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        BasicStrategy,
        JwtStrategy,
        EmailService,
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
    await prismaService.rating.deleteMany({});
    await prismaService.recipe.deleteMany({});
    await prismaService.user.deleteMany({});
    await prismaService.signUpRequests.deleteMany({});
  });

  describe('/auth/signup', () => {
    it('should create user in the database', async () => {
      // when
      const { status } = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'email@email.com', password: 'password' });

      // then
      expect(status).toBe(HttpStatus.CREATED);
    });

    it('should throw an error if user already exists in database', async () => {
      // when
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'email@email.com', password: 'password' });

      const { status } = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'email@email.com', password: 'password' });

      // then
      expect(status).toBe(HttpStatus.CONFLICT);
    });

    it('should throw an error if user does not provide any credentials', async () => {
      // when
      const { status } = await request(app.getHttpServer()).post(
        '/auth/signup',
      );

      // then
      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/auth/login', () => {
    it('should sign in user if credentials are valid', async () => {
      // given
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

      // when
      const { status } = await request(app.getHttpServer())
        .post('/auth/login')
        .set({
          Authorization: `Basic ${data}`,
        });

      // then
      expect(status).toBe(HttpStatus.OK);
    });

    it('should return access token if user is authenticated', async () => {
      // given
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

      // when
      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .set({
          Authorization: `Basic ${data}`,
        });

      // then
      expect(body).toEqual({
        accessToken: expect.any(String),
      });
    });

    it('should throw an error if user is not authenticated', async () => {
      // when
      const { status } = await request(app.getHttpServer())
        .post('/auth/login')
        .set({
          Authorization:
            'Basic dXNlckBtb29kdXAudGVhbTpteXN1cGVyc3Ryb25ncGFzc3dvcmQ=',
        });
      // then
      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/auth/register', () => {
    it('should create sign up request in database', async () => {
      // given
      const email = faker.internet.email();
      const password = faker.internet.password();

      // when
      const { status } = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password });

      // then
      expect(status).toBe(HttpStatus.CREATED);
    });

    it('should throw an error if user does not provide any data', async () => {
      // when
      const { status } = await request(app.getHttpServer()).post(
        '/auth/register',
      );

      // then
      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/auth/confirm', () => {
    it('should confirm user sign up request', async () => {
      // given
      const email = faker.internet.email();
      const password = faker.internet.password();
      const hashedPassword = await bcrypt.hash(password, 10);
      const validationToken = jwtService.sign({ email });
      await prismaService.signUpRequests.create({
        data: { email, password: hashedPassword, validationToken },
      });

      // when
      const { status } = await request(app.getHttpServer())
        .post('/auth/confirm')
        .send({ email, validationToken });

      // then
      expect(status).toBe(HttpStatus.CREATED);
    });

    it('should throw an error if user does not provide any data', async () => {
      // when
      const { status } = await request(app.getHttpServer()).post(
        '/auth/register',
      );

      // then
      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should throw an error if user already created signup request', async () => {
      // given
      const email = faker.internet.email();
      const password = faker.internet.password();
      const hashedPassword = await bcrypt.hash(password, 10);
      const validationToken = jwtService.sign({ email });
      await prismaService.signUpRequests.create({
        data: { email, password: hashedPassword, validationToken },
      });
      // when
      await request(app.getHttpServer())
        .post('/auth/confirm')
        .send({ email, validationToken });
      const { status } = await request(app.getHttpServer())
        .post('/auth/confirm')
        .send({ email, validationToken });

      // then
      expect(status).toBe(HttpStatus.CONFLICT);
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/forgot-password', () => {
    it('should return 200 when password reset request is created', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: faker.internet.email(),
        });

      expect(status).toBe(HttpStatus.OK);
    });
  });
});
