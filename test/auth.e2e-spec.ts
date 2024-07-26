import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { UsersModule } from '../src/users/users.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

describe('auth (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [UsersModule],
      controllers: [AuthController],
      providers: [PrismaService, AuthService],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

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

    const { status } = await request(app.getHttpServer()).post('/auth/signup');
    expect(status).toBe(400);
  });

  afterAll(async () => {
    await app.close();
  });
});
