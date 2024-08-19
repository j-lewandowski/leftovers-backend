import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { RecipesController } from '../src/recipes/recipes.controller';
import { RecipesService } from '../src/recipes/recipes.service';
import { RecipesRepository } from '../src/recipes/recipes.repository';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { faker } from '@faker-js/faker';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RecipesGuard } from '../src/recipes/recipes.guard';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { Visibility } from '@prisma/client';
import { jwtConstants } from '../src/auth/constants';

describe('RecipesController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        ConfigModule.forRoot({
          envFilePath: '.env.test.local',
          isGlobal: true,
        }),
        PassportModule,
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '24h' },
        }),
      ],
      controllers: [RecipesController],
      providers: [RecipesService, RecipesRepository, RecipesGuard, JwtStrategy],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  beforeEach(async () => {
    await prismaService.rating.deleteMany({});
    await prismaService.recipe.deleteMany({});
    await prismaService.user.deleteMany({});
  });

  describe('/recipes', () => {
    it('GET /recipes should return an array of recipes', async () => {
      // when
      await prismaService.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
          recipe: {
            create: [
              {
                title: faker.commerce.productName(),
              },
              {
                title: faker.commerce.productName(),
              },
            ],
          },
        },
      });
      // then
      return request(app.getHttpServer())
        .get('/recipes')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('GET /recipes?details=true should return an array of recipes with all the data', async () => {
      // when
      await prismaService.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
          recipe: {
            create: [
              {
                title: faker.commerce.productName(),
              },
            ],
          },
        },
      });

      // then
      return request(app.getHttpServer())
        .get('/recipes?details=true')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([
            {
              id: expect.any(String),
              authorId: expect.any(String),
              avgRating: expect.any(String),
              categoryName: expect.any(String),
              createdAt: expect.any(String),
              description: expect.any(String),
              ingredients: null,
              preparationMethod: null,
              preparationTime: expect.any(String),
              title: expect.any(String),
              visibility: expect.any(String),
            },
          ]);
        });
    });

    it('GET /recipes?category=breakfast should return an array of recipes from breakfast category with only necessary data', async () => {
      // when
      await prismaService.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
          recipe: {
            create: [
              {
                title: faker.commerce.productName(),
                categoryName: 'breakfast',
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
              },
            ],
          },
        },
      });

      // then
      return request(app.getHttpServer())
        .get('/recipes?category=breakfast')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([
            {
              id: expect.any(String),
              avgRating: expect.any(String),
              description: expect.any(String),
              title: expect.any(String),
            },
          ]);
        });
    });

    it('GET /recipes?category=breakfast should return an array of recipes that include tomato in the ingredients from breakfast category with only necessary data', async () => {
      // when
      await prismaService.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
          recipe: {
            create: [
              {
                title: faker.commerce.productName(),
                categoryName: 'breakfast',
                ingredients: ['tomatoes'],
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
              },
            ],
          },
        },
      });

      // then
      return request(app.getHttpServer())
        .get('/recipes?category=breakfast&ingredients=tomato')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([
            {
              id: expect.any(String),
              avgRating: expect.any(String),
              description: expect.any(String),
              title: expect.any(String),
            },
          ]);
        });
    });
  });

  describe('/recipes/:id', () => {
    it('GET /recipes/:id should return 200 if recipe exists', async () => {
      // given
      const createRes = await prismaService.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
          recipe: {
            create: [
              {
                title: faker.commerce.productName(),
                categoryName: 'breakfast',
                ingredients: ['tomatoes'],
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
              },
            ],
          },
        },
        include: {
          recipe: true,
        },
      });

      // then
      return request(app.getHttpServer())
        .get(`/recipes/${createRes.recipe[0].id}`)
        .expect(200);
    });

    it('GET /recipes/:id should return 403 if recipe exists but user does not have access to it', async () => {
      // given
      const createRes = await prismaService.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
          recipe: {
            create: [
              {
                title: faker.commerce.productName(),
                categoryName: 'breakfast',
                ingredients: ['tomatoes'],
                visibility: Visibility.PRIVATE,
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
              },
            ],
          },
        },
        include: {
          recipe: true,
        },
      });

      // then
      return request(app.getHttpServer())
        .get(`/recipes/${createRes.recipe[0].id}`)
        .expect(403);
    });

    it('GET /recipes/:id should return 404 if recipe does not exist', async () => {
      // when
      return request(app.getHttpServer())
        .get(`/recipes/${faker.string.uuid()}`)
        .expect(404);
    });

    it('GET /recipes/:id should return 200 if jwt with user id is provided', async () => {
      // when
      const createRes = await prismaService.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
          recipe: {
            create: [
              {
                title: faker.commerce.productName(),
                categoryName: 'breakfast',
                ingredients: ['tomatoes'],
                visibility: Visibility.PRIVATE,
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
              },
            ],
          },
        },
        include: {
          recipe: true,
        },
      });

      const token = jwtService.sign({
        sub: createRes.id,
        email: createRes.email,
      });

      // then
      return request(app.getHttpServer())
        .get(`/recipes/${createRes.recipe[0].id}`)
        .set('Authorization', 'Bearer ' + token)
        .expect(200);
    });
  });
});
