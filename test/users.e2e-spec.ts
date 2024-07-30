import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersService } from '../src/users/users.service';
import { PrismaModule } from '../src/prisma/prisma.module';
import { UsersController } from '../src/users/users.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersRepository } from '../src/users/users.repository';
import { AuthService } from '../src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../src/auth/constants';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';

describe('users (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        PrismaModule,
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '24h' },
        }),
      ],
      providers: [UsersService, UsersRepository, AuthService, JwtStrategy],
      controllers: [UsersController],
    }).compile();

    app = moduleFixture.createNestApplication();
    usersService = moduleFixture.get<UsersService>(UsersService);
    authService = moduleFixture.get<AuthService>(AuthService);
    await app.init();
  });

  it('/ (GET)', async () => {
    const { access_token } = await authService.login({
      id: 'id',
      email: 'email@email.com',
      createdAt: new Date(),
    });

    jest.spyOn(usersService, 'getEmails').mockResolvedValue({
      emails: [{ email: 'email1@email.com' }, { email: 'email2@email.com' }],
    });

    const { body } = await request(app.getHttpServer())
      .get('/')
      .set('Authorization', 'Bearer ' + access_token)
      .expect(200);
    expect(body).toEqual({
      emails: [{ email: 'email1@email.com' }, { email: 'email2@email.com' }],
    });
  });

  it('should throw an error if user is not authenticated.', async () => {
    await request(app.getHttpServer()).get('/').expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
