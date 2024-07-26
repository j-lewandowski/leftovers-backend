import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersService } from '../src/users/users.service';
import { PrismaModule } from '../src/prisma/prisma.module';
import { UsersController } from '../src/users/users.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersRepository } from '../src/users/users.repository';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, PrismaModule],
      providers: [UsersService, UsersRepository],
      controllers: [UsersController],
    }).compile();

    app = moduleFixture.createNestApplication();
    usersService = moduleFixture.get<UsersService>(UsersService);
    await app.init();
  });

  it('/ (GET)', async () => {
    jest.spyOn(usersService, 'getEmails').mockResolvedValue({
      emails: [
        { email: 'email1@email.com' },
        { email: 'email2@email.com' },
        { email: 'email3@email.com' },
      ],
    });

    const { body } = await request(app.getHttpServer()).get('/').expect(200);
    expect(body).toEqual({
      emails: [
        { email: 'email1@email.com' },
        { email: 'email2@email.com' },
        { email: 'email3@email.com' },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
