import { Test } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { RecipesRepository } from './recipes.repository';
import { faker } from '@faker-js/faker';
import { PreparationTime, Visibility } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

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
            getOne: jest.fn(),
            create: jest.fn(),
          }),
        },
      ],
    }).compile();

    recipesService = moduleRef.get<RecipesService>(RecipesService);
    recipesRepository = moduleRef.get<RecipesRepository>(RecipesRepository);
  });

  const recipe = {
    id: faker.string.uuid(),
    title: faker.commerce.product(),
    description: 'description',
    preparationTime: PreparationTime.UP_TO_15_MIN,
    preparationSteps: [],
    servings: 2,
    image: faker.internet.url(),
    ingredients: [],
    createdAt: new Date(),
    authorId: faker.string.uuid(),
    categoryName: 'dinner',
    visibility: Visibility.PUBLIC,
    rating: [],
  };

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
      // given
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

      // when
      const result = await recipesService.findAll(userId, filters);

      // then
      expect(result).toEqual(expectedRecipes);
    });
  });

  describe('findOne', () => {
    it('should return a recipe with caluclated rating', async () => {
      // given
      jest.spyOn(recipesRepository, 'getOne').mockResolvedValue(recipe);

      // when
      const res = await recipesService.findOne(
        faker.string.uuid(),
        faker.string.uuid(),
      );
      const { rating: _, ...otherFields } = recipe;
      // then
      expect(res).toEqual({ ...otherFields, avgRating: 0 });
    });

    it('should throw forbidden error if recipe is private and user is not an author', async () => {
      // given
      jest
        .spyOn(recipesRepository, 'getOne')
        .mockResolvedValue({ ...recipe, visibility: Visibility.PRIVATE });

      // when
      expect(
        recipesService.findOne(faker.string.uuid(), faker.string.uuid()),
        // then
      ).rejects.toEqual(new ForbiddenException());
    });

    it('should throw not found error if recipe does not exist', async () => {
      // given
      jest.spyOn(recipesRepository, 'getOne').mockResolvedValue(null);

      // when
      expect(
        recipesService.findOne(faker.string.uuid(), faker.string.uuid()),
        // then
      ).rejects.toEqual(new NotFoundException());
    });
  });

  describe('create', () => {
    it('should create new recipe', async () => {
      // given
      jest.spyOn(recipesRepository, 'create').mockResolvedValue(recipe);

      // when
      const res = await recipesService.create(recipe, faker.string.uuid());

      // then
      expect(res).toBe(recipe);
    });
  });
});
