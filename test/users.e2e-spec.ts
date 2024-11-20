import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsersController } from '../src/users/users.controller';
import { UsersRepository } from '../src/users/users.repository';
import { UsersService } from '../src/users/users.service';

describe('users (e2e)', () => {
  let app: INestApplication;
  let jwt: JwtService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
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
      providers: [UsersService, UsersRepository, JwtStrategy],
      controllers: [UsersController],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwt = moduleFixture.get<JwtService>(JwtService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.clearDatabase();
  });

  it("shoud return users' emails if user is authenticated", async () => {
    // given
    await prisma.user.createMany({
      data: [
        { email: faker.internet.email(), password: faker.internet.password() },
        { email: faker.internet.email(), password: faker.internet.password() },
        { email: faker.internet.email(), password: faker.internet.password() },
      ],
    });
    const access_token = jwt.sign({
      id: faker.string.uuid(),
      email: faker.internet.email(),
    });

    // when
    const { body } = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', 'Bearer ' + access_token)
      .expect(200);

    // then
    expect(body).toEqual({
      emails: [
        { email: expect.any(String) },
        { email: expect.any(String) },
        { email: expect.any(String) },
      ],
    });
  });

  it('should throw an error if user is not authenticated.', async () => {
    // when
    await request(app.getHttpServer())
      .get('/users')
      // then
      .expect(401);
  });

  it('PUT /users/save-recipes should add recipe to favourites', async () => {
    // given
    const data = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: faker.internet.password(),
        recipe: {
          create: [
            {
              title: faker.commerce.productName(),
              categoryName: 'breakfast',
              imageKey: 'test/test.png',
            },
          ],
        },
      },
      include: {
        recipe: true,
      },
    });

    const accessToken = jwt.sign({
      sub: data.id,
      email: data.email,
    });

    // when
    return (
      request(app.getHttpServer())
        .put(`/users/save-recipes`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ recipeId: data.recipe[0].id, save: true })
        // then
        .expect(HttpStatus.OK)
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
