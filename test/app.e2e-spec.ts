import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UsersService } from '../src/users/users.service';
import { UsersRepository } from '../src/users/users.repository';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UsersService, UsersRepository, PrismaService],
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
