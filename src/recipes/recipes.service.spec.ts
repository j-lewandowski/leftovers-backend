import { Test } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { RecipesRepository } from './recipes.repository';
import { faker } from '@faker-js/faker';

describe('RecipesService', () => {
  let recipesService: RecipesService;
  let recipesRepository: RecipesRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: RecipesRepository,
          useFactory: () => ({
            getAll: jest.fn(),
          }),
        },
      ],
    }).compile();

    recipesService = moduleRef.get<RecipesService>(RecipesService);
    recipesRepository = moduleRef.get<RecipesRepository>(RecipesRepository);
  });

  describe('findAll', () => {
    it('should call recipesRepository.getAll with the correct parameters', async () => {
      // given
      const userId = faker.string.uuid();
      const filters = {
        category: ['breakfast'],
      };

      // when
      await recipesService.findAll(userId, filters);

      // then
      expect(recipesRepository.getAll).toHaveBeenCalledWith(userId, filters);
    });

    it('should return an array of recipes', async () => {
      const userId = faker.string.uuid();
      const filters = {
        category: ['breakfast'],
      };
      const expectedRecipes = [
        {
          id: 'recipe1',
          title: 'Pancakes',
          description: 'description',
          avgRating: 3.0,
        },
        {
          id: 'recipe2',
          title: 'Omelette',
          description: 'description',
          avgRating: 3.0,
        },
      ];

      jest
        .spyOn(recipesRepository, 'getAll')
        .mockResolvedValue(expectedRecipes);

      const result = await recipesService.findAll(userId, filters);

      expect(result).toEqual(expectedRecipes);
    });
  });
});
