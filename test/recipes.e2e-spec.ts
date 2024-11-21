import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PreparationTime, Visibility } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('RecipesController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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
    await prismaService.clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/recipes', () => {
    it('GET /recipes should return an object of recipes 50 first recipes', async () => {
      // when
      await prismaService.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
          recipe: {
            create: [
              {
                title: faker.commerce.productName(),
                imageKey: 'test/test.png',
              },
              {
                title: faker.commerce.productName(),
                imageKey: 'test/test.png',
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
          expect(res.body).toEqual({
            limit: 50,
            page: 1,
            recipes: expect.any(Array),
            totalRecipes: expect.any(Number),
          });
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
                imageKey: 'test/test.png',
                ingredients: ['ingredient 1'],
                preparationSteps: ['step 1'],
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
          expect(res.body).toMatchObject({
            limit: 50,
            page: 1,
            recipes: [
              {
                authorId: expect.any(String),
                categoryName: expect.any(String),
                createdAt: expect.any(String),
                description: expect.any(String),
                id: expect.any(String),
                imageUrl: expect.any(String),
                ingredients: expect.any(Array),
                isSaved: expect.any(Boolean),
                numberOfRatings: expect.any(Number),
                preparationSteps: expect.any(Array),
                preparationTime: expect.any(String),
                rating: expect.any(Number),
                servings: expect.any(Number),
                title: expect.any(String),
                visibility: expect.any(String),
              },
            ],
            // recipes: expect.any(Array),
            totalRecipes: expect.any(Number),
          });
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
                imageKey: 'test/test.png',
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                imageKey: 'test/test.png',
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
          expect(res.body).toEqual({
            limit: 50,
            page: 1,
            recipes: expect.arrayContaining([
              expect.objectContaining({
                description: expect.any(String),
                id: expect.any(String),
                imageUrl: expect.any(String),
                isSaved: expect.any(Boolean),
                numberOfRatings: expect.any(Number),
                rating: expect.any(Number),
                title: expect.any(String),
                visibility: expect.any(String),
              }),
            ]),
            totalRecipes: expect.any(Number),
          });
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
                imageKey: 'test/test.png',
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                imageKey: 'test/test.png',
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
          expect(res.body).toEqual({
            limit: 50,
            page: 1,
            recipes: expect.arrayContaining([
              expect.objectContaining({
                description: expect.any(String),
                id: expect.any(String),
                imageUrl: expect.any(String),
                isSaved: expect.any(Boolean),
                numberOfRatings: expect.any(Number),
                rating: expect.any(Number),
                title: expect.any(String),
                visibility: expect.any(String),
              }),
            ]),
            totalRecipes: expect.any(Number),
          });
        });
    });

    it('GET /recipes?sort=rating,desc should sort the results by rating field', async () => {
      // when
      const data = await prismaService.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
          recipe: {
            create: [
              {
                id: '1',
                title: 'Recipe 1',
                categoryName: 'breakfast',
                imageKey: 'test/test.png',
              },
              {
                id: '2',
                title: 'Recipe 2',
                categoryName: 'drinks',
                imageKey: 'test/test.png',
              },
            ],
          },
          rating: {
            create: {
              value: 5,
              recipeId: '2',
            },
          },
        },

        include: {
          recipe: true,
          rating: true,
        },
      });

      await prismaService.rating.create({
        data: {
          userId: data.id,
          recipeId: data.recipe[1].id,
          value: 5,
        },
      });

      // then
      return request(app.getHttpServer())
        .get('/recipes?sort=rating,desc')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.recipes[0].title).toBe('Recipe 2');
        });
    });

    it('GET /recipes?sort=unknown,desc should return 400', async () => {
      // then
      return request(app.getHttpServer())
        .get('/recipes?sort=unknown,desc')
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('GET /recipes?saved=true should return only saved recipes', async () => {
      // given
      const data = await prismaService.user.create({
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
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                imageKey: 'test/test.png',
              },
            ],
          },
        },
        include: {
          recipe: true,
        },
      });
      await prismaService.savedRecipe.create({
        data: { userId: data.id, recipeId: data.recipe[0].id },
      });

      // then
      return request(app.getHttpServer())
        .get('/recipes?saved=true')
        .set('Authorization', 'Bearer ' + jwtService.sign({ sub: data.id }))
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.recipes.length).toBe(1);
        });
    });

    it('GET /recipes?myRecipes=true should return only recipes created by user', async () => {
      // given
      const data = await prismaService.user.create({
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
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                imageKey: 'test/test.png',
              },
            ],
          },
        },
        include: {
          recipe: true,
        },
      });

      await prismaService.user.create({
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
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                imageKey: 'test/test.png',
              },
            ],
          },
        },
      });

      // then
      return request(app.getHttpServer())
        .get('/recipes?myRecipes=true')
        .set('Authorization', 'Bearer ' + jwtService.sign({ sub: data.id }))
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.recipes.length).toBe(2);
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
          imageKey: 'test/test.png',
          preparationTime: PreparationTime.UpTo15Min,
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
        imageKey: expect.any(String),
        visibility: Visibility.PUBLIC,
        servings: 1,
        preparationTime: PreparationTime.UpTo15Min,
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
          imageKey: 'test/test.png',
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
          imageKey: 'test/test.png',
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
                imageKey: 'test/test.png',
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                imageKey: 'test/test.png',
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
                imageKey: 'test/test.png',
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                imageKey: 'test/test.png',
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
                imageKey: 'test/test.png',
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                imageKey: 'test/test.png',
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

    it('DELETE /recipes/:id should delete recipe', async () => {
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
                imageKey: 'test/test.png',
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                imageKey: 'test/test.png',
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
        .delete(`/recipes/${createRes.recipe[0].id}`)
        .set(
          'Authorization',
          'Bearer ' + jwtService.sign({ sub: createRes.id }),
        )
        .expect(HttpStatus.NO_CONTENT);
    });

    it('PATCH /recipes/:id should update recipe', async () => {
      // given
      const createRes = await prismaService.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
          recipe: {
            create: [
              {
                title: 'Test',
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

      // when
      const { body } = await request(app.getHttpServer())
        .patch(`/recipes/${createRes.recipe[0].id}`)
        .set(
          'Authorization',
          'Bearer ' + jwtService.sign({ sub: createRes.id }),
        )
        .send({
          title: 'Updated title',
          description: 'Updated description',
          ingredients: ['cheese'],
          preparationSteps: ['1 step'],
          categoryName: 'lunch',
          imageKey: 'test/test.png',
          preparationTime: PreparationTime.UpTo15Min,
          visibility: Visibility.PUBLIC,
          servings: 1,
        })
        .expect(HttpStatus.OK);

      // then
      expect(body).toEqual({
        id: expect.any(String),
        title: 'Updated title',
        description: 'Updated description',
        ingredients: ['cheese'],
        preparationSteps: ['1 step'],
        categoryName: 'lunch',
        imageKey: expect.any(String),
        visibility: Visibility.PUBLIC,
        servings: 1,
        preparationTime: PreparationTime.UpTo15Min,
        authorId: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it('PATCH /recipes/:id should throw an error if user is not the author of the recipe', async () => {
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
                imageKey: 'test/test.png',
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                imageKey: 'test/test.png',
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
        .patch(`/recipes/${createRes.recipe[0].id}`)
        .set(
          'Authorization',
          'Bearer ' + jwtService.sign({ sub: faker.string.uuid() }),
        )
        .send({
          title: 'Updated title',
          description: 'Updated description',
          ingredients: ['cheese'],
          preparationSteps: ['1 step'],
          categoryName: 'lunch',
          imageKey: 'test/test.png',
          preparationTime: PreparationTime.UpTo15Min,
          visibility: Visibility.PUBLIC,
          servings: 1,
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('DELETE /recipes/:id should throw an error if user is not the author of the recipe', async () => {
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
                imageKey: 'test/test.png',
              },
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                imageKey: 'test/test.png',
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
        .delete(`/recipes/${createRes.recipe[0].id}`)
        .set(
          'Authorization',
          'Bearer ' + jwtService.sign({ sub: faker.string.uuid() }),
        )
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('/recipes/recipe-of-the-day', () => {
    it('PUT /recipes/recipe-of-the-day should refresh recipe of the day', async () => {
      // given
      const data = await prismaService.user.create({
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
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                imageKey: 'test/test.png',
              },
            ],
          },
        },
        include: {
          recipe: true,
        },
      });

      await prismaService.recipeOfTheDay.create({
        data: { recipeId: data.recipe[0].id },
      });

      // when
      return (
        request(app.getHttpServer())
          .put('/recipes/recipe-of-the-day')
          // then
          .expect(HttpStatus.OK)
      );
    });

    it('GET /recipes/recipe-of-the-day should get current recipe of the day', async () => {
      // given
      const data = await prismaService.user.create({
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
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                imageKey: 'test/test.png',
              },
            ],
          },
        },
        include: {
          recipe: true,
        },
      });
      await prismaService.recipeOfTheDay.create({
        data: { recipeId: data.recipe[0].id },
      });

      // when
      return (
        request(app.getHttpServer())
          .get('/recipes/recipe-of-the-day')
          // then
          .expect(HttpStatus.OK)
      );
    });
  });

  describe('/recipes/:id/rating', () => {
    it('POST /recipes/:id/rating should rate recipe', async () => {
      // given
      const data = await prismaService.user.create({
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
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                imageKey: 'test/test.png',
              },
            ],
          },
        },
        include: {
          recipe: true,
        },
      });

      const token = jwtService.sign({
        sub: data.id,
        email: data.email,
      });

      // when
      return (
        request(app.getHttpServer())
          .post(`/recipes/${data.recipe[0].id}/rate-recipe`)
          .set('Authorization', 'Bearer ' + token)
          .send({ value: 5 })
          // then
          .expect(HttpStatus.CREATED)
      );
    });

    it('POST /recipes/:id/rating should throw an error if user already rated the recipe', async () => {
      // given
      const data = await prismaService.user.create({
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
              {
                title: faker.commerce.productName(),
                categoryName: 'drinks',
                imageKey: 'test/test.png',
              },
            ],
          },
        },
        include: {
          recipe: true,
        },
      });

      const token = jwtService.sign({
        sub: data.id,
        email: data.email,
      });

      await prismaService.rating.create({
        data: {
          userId: data.id,
          recipeId: data.recipe[0].id,
          value: 5,
        },
      });

      // when
      return (
        request(app.getHttpServer())
          .post(`/recipes/${data.recipe[0].id}/rate-recipe`)
          .set('Authorization', 'Bearer ' + token)
          .send({ value: 5 })
          // then
          .expect(HttpStatus.CONFLICT)
      );
    });
  });
});
