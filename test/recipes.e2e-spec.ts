import { faker } from '@faker-js/faker';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { RecipesController } from '../src/recipes/recipes.controller';
import { RecipesGuard } from '../src/recipes/recipes.guard';
import { RecipesRepository } from '../src/recipes/recipes.repository';
import { RecipesService } from '../src/recipes/recipes.service';

describe('RecipesController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

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
          secret: 'test-secret',
        }),
      ],
      controllers: [RecipesController],
      providers: [RecipesService, RecipesRepository, RecipesGuard, JwtStrategy],
    }).compile();

    app = moduleFixture.createNestApplication();
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
});
