import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { PreparationTime, Visibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetRecipesFiltersDto } from './dto/get-recipes-filter.dto';
import { QueryRecipeDto } from './dto/query-recipe.dto';
import { RecipesRepository } from './recipes.repository';

describe('RecipesRepository', () => {
  let recipesRepository: RecipesRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RecipesRepository,
        {
          provide: PrismaService,
          useValue: {
            client: {
              recipe: {
                getAllRecipes: jest.fn(),
                getSingleRecipe: jest.fn(),
              },
            },
            recipe: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    recipesRepository = moduleRef.get<RecipesRepository>(RecipesRepository);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  const recipe = {
    title: faker.commerce.product(),
    description: 'description',
    preparationTime: PreparationTime.UP_TO_15_MIN,
    preparationSteps: [],
    imageKey: 'image/key',
    ingredients: [],
    servings: 2,
    createdAt: new Date(),
    image: faker.internet.url(),
    categoryName: 'dinner',
    visibility: Visibility.PRIVATE,
  };

  describe('getAll', () => {
    it('should return an array of RecipeDto objects', async () => {
      // given
      const userId = faker.string.uuid();
      const expectedRecipes: QueryRecipeDto[] = [
        {
          id: faker.string.uuid(),
          title: 'Pancakes',
          description: 'description',
          rating: 3.0,
          imageKey: 'image/key',
          isSaved: false,
          numberOfRatings: 1,
        },
        {
          id: faker.string.uuid(),
          title: 'Omelette',
          description: 'description',
          rating: 5.0,
          imageKey: 'image/key',
          isSaved: true,
          numberOfRatings: 1,
        },
      ];

      jest
        .spyOn(prismaService.client.recipe, 'getAllRecipes')
        .mockResolvedValue(expectedRecipes);

      // when
      const result = await recipesRepository.getAll(userId, {});

      // then
      expect(result).toEqual(expectedRecipes);
    });

    it('should return an empty array if no recipes are found', async () => {
      // given
      const params: GetRecipesFiltersDto = {
        category: ['dinner'],
      };

      jest
        .spyOn(prismaService.client.recipe, 'getAllRecipes')
        .mockResolvedValue([]);

      // when
      const result = await recipesRepository.getAll(null, params);

      // then
      expect(result).toEqual([]);
    });
  });

  describe('getOne', () => {
    it('should return a single recipe if it exists in database', async () => {
      // given
      const recipeResult = {
        id: faker.string.uuid(),
        ...recipe,
        authorId: faker.string.uuid(),
        rating: 3,
        isSaved: false,
        numberOfRatings: 1,
      };
      jest
        .spyOn(prismaService.client.recipe, 'getSingleRecipe')
        .mockResolvedValue(recipeResult);

      // when
      const res = await recipesRepository.getOne(faker.string.uuid());

      // then
      expect(res).toBe(recipeResult);
    });
  });

  describe('create', () => {
    it('should create new recipe in database and return recipe object', async () => {
      // given
      const recipeResult = {
        id: faker.string.uuid(),
        ...recipe,
        authorId: faker.string.uuid(),
      };
      jest
        .spyOn(prismaService.recipe, 'create')
        .mockResolvedValue(recipeResult);

      // when
      const res = await recipesRepository.create(recipe, faker.string.uuid());

      // then

      expect(res).toBe(recipeResult);
    });
  });
});
