import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { PreparationTime, Visibility } from '@prisma/client';
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
      controllers: [RecipesController],
      providers: [
        RecipesService,
        RecipesRepository,
        RecipesGuard,
        JwtStrategy,
        JwtService,
      ],
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
                image: faker.internet.url(),
              },
              {
                title: faker.commerce.productName(),
                image: faker.internet.url(),
              },
            ],
          },
        },
      });
      // then
      return request(app.getHttpServer())
        .get('/recipes')
        .expect(HttpStatus.OK)
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
                image: faker.internet.url(),
              },
            ],
          },
        },
      });

      // then
      return request(app.getHttpServer())
        .get('/recipes?details=true')
        .expect(HttpStatus.OK)
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
              preparationSteps: null,
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
                image: faker.internet.url(),
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                image: faker.internet.url(),
              },
            ],
          },
        },
      });

      // then
      return request(app.getHttpServer())
        .get('/recipes?category=breakfast')
        .expect(HttpStatus.OK)
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
                image: faker.internet.url(),
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                image: faker.internet.url(),
              },
            ],
          },
        },
      });

      // then
      return request(app.getHttpServer())
        .get('/recipes?category=breakfast&ingredients=tomato')
        .expect(HttpStatus.OK)
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

    it('POST /recipes should add recipe to database and return recipe data from endpoint', async () => {
      // given
      const createRes = await prismaService.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
        },
      });
      const token = jwtService.sign({
        sub: createRes.id,
        email: createRes.email,
      });

      // when
      const { body } = await request(app.getHttpServer())
        .post('/recipes')
        .set('Authorization', 'Bearer ' + token)
        .send({
          title: 'Test',
          description: 'Test description',
          ingredients: ['cheese'],
          preparationSteps: ['1 step'],
          categoryName: 'lunch',
          image: faker.internet.url(),
          preparationTime: PreparationTime.UP_TO_15_MIN,
          visibility: Visibility.PUBLIC,
          servings: 1,
        })
        .expect(HttpStatus.CREATED);

      // then
      expect(body).toEqual({
        id: expect.any(String),
        title: 'Test',
        description: 'Test description',
        ingredients: ['cheese'],
        preparationSteps: ['1 step'],
        categoryName: 'lunch',
        image: expect.any(String),
        visibility: Visibility.PUBLIC,
        servings: 1,
        preparationTime: PreparationTime.UP_TO_15_MIN,
        authorId: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it('POST /recipes should throw an error if title is empty', async () => {
      // given
      const createRes = await prismaService.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
        },
      });
      const token = jwtService.sign({
        sub: createRes.id,
        email: createRes.email,
      });

      request(app.getHttpServer())
        .post('/recipes')
        .set('Authorization', 'Bearer ' + token)
        .send({
          title: '',
          description: 'Test description',
          ingredients: ['cheese'],
          preparationSteps: ['1 step'],
          categoryName: 'lunch',
          image: faker.internet.url(),
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /recipes should throw an error if ingredients are empty', async () => {
      // given
      const createRes = await prismaService.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
        },
      });
      const token = jwtService.sign({
        sub: createRes.id,
        email: createRes.email,
      });

      request(app.getHttpServer())
        .post('/recipes')
        .set('Authorization', 'Bearer ' + token)
        .send({
          title: 'title',
          description: 'Test description',
          ingredients: [],
          preparationSteps: ['1 step'],
          categoryName: 'lunch',
          image: faker.internet.url(),
        })
        .expect(HttpStatus.BAD_REQUEST);
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
                image: faker.internet.url(),
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                image: faker.internet.url(),
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
        .expect(HttpStatus.OK);
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
                image: faker.internet.url(),
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                image: faker.internet.url(),
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
        .expect(HttpStatus.FORBIDDEN);
    });

    it('GET /recipes/:id should return 404 if recipe does not exist', async () => {
      // when
      return request(app.getHttpServer())
        .get(`/recipes/${faker.string.uuid()}`)
        .expect(HttpStatus.NOT_FOUND);
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
                image: faker.internet.url(),
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                image: faker.internet.url(),
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
        .expect(HttpStatus.OK);
    });
  });
});
