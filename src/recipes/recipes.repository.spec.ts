import { Test } from '@nestjs/testing';
import { RecipesRepository } from './recipes.repository';
import { PrismaService } from '../prisma/prisma.service';
import { GetRecepiesFiltersDto } from './dto/get-recepies-filter.dto';
import { RecipeDto } from './dto/recipe.dto';
import { faker } from '@faker-js/faker';

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
});
