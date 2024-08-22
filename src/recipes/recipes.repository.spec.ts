import { Test } from '@nestjs/testing';
import { RecipesRepository } from './recipes.repository';
import { PrismaService } from '../prisma/prisma.service';
import { GetRecepiesFiltersDto } from './dto/get-recepies-filter.dto';
import { RecipeDto } from './dto/recipe.dto';
import { faker } from '@faker-js/faker';
import { PreparationTime, Visibility } from '@prisma/client';

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
            $queryRawUnsafe: jest.fn(),
            recipe: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    recipesRepository = moduleRef.get<RecipesRepository>(RecipesRepository);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  describe('getAll', () => {
    it('should return an array of RecipeDto objects', async () => {
      // given
      const userId = faker.string.uuid();
      const expectedRecipes: RecipeDto[] = [
        {
          id: faker.string.uuid(),
          title: 'Pancakes',
          description: 'description',
          avgRating: 3.0,
        },
        {
          id: faker.string.uuid(),
          title: 'Omelette',
          description: 'description',
          avgRating: 5.0,
        },
      ];

      jest
        .spyOn(prismaService, '$queryRawUnsafe')
        .mockResolvedValue(expectedRecipes);

      // when
      const result = await recipesRepository.getAll(userId, {});

      // then
      expect(result).toEqual(expectedRecipes);
    });

    it('should return an empty array if no recipes are found', async () => {
      // given
      const params: GetRecepiesFiltersDto = {
        category: ['dinner'],
      };

      // Mock the PrismaService method to return an empty array
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValue([]);

      // when
      const result = await recipesRepository.getAll(null, params);

      // then
      expect(result).toEqual([]);
    });
  });

  describe('getOne', () => {
    it('should return a single recipe if it exists in database', async () => {
      // given
      const recipe = {
        id: faker.string.uuid(),
        title: faker.commerce.product(),
        description: 'description',
        preparationTime: PreparationTime.UP_TO_15_MIN,
        preparationMethod: [],
        ingredients: [],
        createdAt: new Date(),
        authorId: faker.string.uuid(),
        categoryName: 'dinner',
        visibility: Visibility.PRIVATE,
      };
      jest.spyOn(prismaService.recipe, 'findFirst').mockResolvedValue(recipe);

      // when
      const res = await recipesRepository.getOne(faker.string.uuid());

      // then
      expect(res).toBe(recipe);
    });
  });
});
