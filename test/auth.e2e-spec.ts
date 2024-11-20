import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('auth (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
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
    await prismaService.clearDatabase();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
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

    it('should return access token and user id if user is authenticated', async () => {
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
      // when
      const { status } = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: faker.internet.email(),
        });
      // then
      expect(status).toBe(HttpStatus.ACCEPTED);
    });
  });

  describe('/auth/reset-password', () => {
    it('should return 200 when password has been updated', async () => {
      // given
      const user = await prismaService.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
        },
      });
      const validationToken = jwtService.sign({
        email: user.email,
      });
      await prismaService.resetPasswordRequest.create({
        data: {
          validationToken,
          email: user.email,
        },
      });

      // when
      const { status } = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          validationToken,
          newPassword: faker.internet.password(),
        });

      // then
      expect(status).toBe(HttpStatus.OK);
    });

    it('should return 401 if jwt is invalid', async () => {
      // when
      const { status } = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          validationToken: 'invalid-token',
          newPassword: faker.internet.password(),
        });
      // then
      expect(status).toBe(401);
    });

    it('should return 401 if password reset request does not exist in database', async () => {
      // given
      const user = await prismaService.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
        },
      });
      const validationToken = jwtService.sign({
        email: user.email,
      });

      // when
      const { status } = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          validationToken: validationToken,
          newPassword: faker.internet.password(),
        });

      // then
      expect(status).toBe(401);
    });
  });
});
