import { faker } from '@faker-js/faker';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { PreparationTime, Visibility } from '@prisma/client';
import { UploadFileService } from '../upload-file/upload-file.service';
import { RecipesRepository } from './recipes.repository';
import { RecipesService } from './recipes.service';

describe('RecipesService', () => {
  let recipesService: RecipesService;
  let recipesRepository: RecipesRepository;
  let uploadFileService: UploadFileService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ConfigService,
        RecipesService,
        UploadFileService,
        {
          provide: RecipesRepository,
          useFactory: () => ({
            getAll: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getOne: jest.fn(),
            create: jest.fn(),
            refreshRecipeOfTheDay: jest.fn(),
            getAllPublicRecipeIds: jest.fn(),
            getRecipeOfTheDay: jest.fn(),
            addRecipeOfTheDay: jest.fn(),
            findRating: jest.fn(),
            rateRecipe: jest.fn(),
          }),
        },
      ],
    }).compile();

    recipesService = moduleRef.get<RecipesService>(RecipesService);
    recipesRepository = moduleRef.get<RecipesRepository>(RecipesRepository);
    uploadFileService = moduleRef.get<UploadFileService>(UploadFileService);
  });

  const recipe = {
    id: faker.string.uuid(),
    title: faker.commerce.product(),
    description: 'description',
    preparationTime: PreparationTime.UpTo15Min,
    preparationSteps: [],
    servings: 2,
    imageKey: 'image/key',
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
      jest.spyOn(recipesRepository, 'getAll').mockResolvedValue([]);
      jest
        .spyOn(uploadFileService, 'getImageUrl')
        .mockResolvedValue(faker.internet.url());

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

      jest.spyOn(recipesRepository, 'getAll').mockResolvedValue([
        {
          id: 'recipe1',
          title: 'Pancakes',
          description: 'description',
          rating: 3.0,
          imageKey: 'image/key',
          isSaved: false,
          numberOfRatings: 3,
          visibility: Visibility.PUBLIC,
        },
        {
          id: 'recipe2',
          title: 'Omelette',
          description: 'description',
          rating: 3.0,
          imageKey: 'image/key',
          isSaved: false,
          numberOfRatings: 3,
          visibility: Visibility.PUBLIC,
        },
      ]);
      jest
        .spyOn(uploadFileService, 'getImageUrl')
        .mockResolvedValue(faker.internet.url());

      // when
      const result = await recipesService.findAll(userId, filters);

      // then
      expect(result).toEqual([
        {
          id: 'recipe1',
          title: 'Pancakes',
          description: 'description',
          rating: 3.0,
          imageUrl: expect.any(String),
          isSaved: false,
          numberOfRatings: 3,
          visibility: Visibility.PUBLIC,
        },
        {
          id: 'recipe2',
          title: 'Omelette',
          description: 'description',
          rating: 3.0,
          imageUrl: expect.any(String),
          isSaved: false,
          numberOfRatings: 3,
          visibility: Visibility.PUBLIC,
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return a recipe with caluclated rating', async () => {
      // given
      jest.spyOn(recipesRepository, 'getOne').mockResolvedValue({
        ...recipe,
        rating: 0,
        isSaved: false,
        numberOfRatings: 3,
      });
      jest
        .spyOn(uploadFileService, 'getImageUrl')
        .mockResolvedValue(faker.internet.url());

      // when
      const res = await recipesService.findOne(
        faker.string.uuid(),
        faker.string.uuid(),
      );

      const { imageKey: _, ...otherFields } = recipe;
      // then
      expect(res).toEqual({
        ...otherFields,
        rating: 0,
        imageUrl: expect.any(String),
        isSaved: false,
        numberOfRatings: 3,
      });
    });

    it('should throw forbidden error if recipe is private and user is not an author', async () => {
      // given
      jest.spyOn(recipesRepository, 'getOne').mockResolvedValue({
        ...recipe,
        visibility: Visibility.PRIVATE,
        rating: 0,
        isSaved: false,
        numberOfRatings: 3,
      });

      jest
        .spyOn(uploadFileService, 'getImageUrl')
        .mockResolvedValue(faker.internet.url());

      // when
      expect(
        recipesService.findOne(faker.string.uuid(), faker.string.uuid()),
        // then
      ).rejects.toEqual(new ForbiddenException());
    });

    it('should throw not found error if recipe does not exist', async () => {
      // given
      jest.spyOn(recipesRepository, 'getOne').mockResolvedValue(null);

      jest
        .spyOn(uploadFileService, 'getImageUrl')
        .mockResolvedValue(faker.internet.url());

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

  describe('refreshRecipeOfTheDay', () => {
    it('should refresh recipe of the day', async () => {
      // given
      jest
        .spyOn(recipesRepository, 'refreshRecipeOfTheDay')
        .mockResolvedValue();
      jest
        .spyOn(recipesRepository, 'getAllPublicRecipeIds')
        .mockResolvedValue([
          { id: faker.string.uuid() },
          { id: faker.string.uuid() },
          { id: faker.string.uuid() },
        ]);
      jest
        .spyOn(recipesRepository, 'getRecipeOfTheDay')
        .mockResolvedValue({ recipeId: faker.string.uuid() });

      // when
      await recipesService.refreshRecipeOfTheDay();

      // then
      expect(recipesRepository.refreshRecipeOfTheDay).toHaveBeenCalled();
    });

    it('should not refresh recipe of the day if there are no recipes in database', async () => {
      // given
      jest
        .spyOn(recipesRepository, 'getAllPublicRecipeIds')
        .mockResolvedValue([]);

      // when
      await recipesService.refreshRecipeOfTheDay();

      // then
      expect(recipesRepository.refreshRecipeOfTheDay).not.toHaveBeenCalled();
    });

    it('should add recipe of the day to database if it does not exist', async () => {
      // given
      jest
        .spyOn(recipesRepository, 'getAllPublicRecipeIds')
        .mockResolvedValue([
          { id: faker.string.uuid() },
          { id: faker.string.uuid() },
          { id: faker.string.uuid() },
        ]);
      jest
        .spyOn(recipesRepository, 'getRecipeOfTheDay')
        .mockResolvedValue(null);
      jest.spyOn(recipesRepository, 'addRecipeOfTheDay').mockResolvedValue();

      // when
      await recipesService.refreshRecipeOfTheDay();

      // then
      expect(recipesRepository.addRecipeOfTheDay).toHaveBeenCalled();
    });
  });

  describe('rateRecipe', () => {
    it('should throw an error if rating for this recipe has already been added by a the user', async () => {
      // given
      jest.spyOn(recipesRepository, 'findRating').mockResolvedValue({
        id: 1234,
        userId: faker.string.uuid(),
        recipeId: faker.string.uuid(),
        value: 4,
      });

      // when
      expect(
        recipesService.rateRecipe(faker.string.uuid(), faker.string.uuid(), 4),
        // then
      ).rejects.toThrowError();
    });

    it('should add new rating if user has not rated this recipe yet', async () => {
      // given
      jest.spyOn(recipesRepository, 'findRating').mockResolvedValue(null);

      // when
      await recipesService.rateRecipe(
        faker.string.uuid(),
        faker.string.uuid(),
        4,
      );

      // then
      expect(recipesRepository.rateRecipe).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should throw an error if recipe does not exist', async () => {
      // given
      jest.spyOn(recipesRepository, 'getOne').mockResolvedValue(null);

      // when
      expect(
        recipesService.update(faker.string.uuid(), recipe, faker.string.uuid()),
        // then
      ).rejects.toThrowError();
    });

    it('should throw an error if user is not an author of the recipe', async () => {
      // given
      jest.spyOn(recipesRepository, 'getOne').mockResolvedValue({
        ...recipe,
        rating: 0,
        isSaved: false,
        numberOfRatings: 3,
      });

      // when
      expect(
        recipesService.update(faker.string.uuid(), recipe, faker.string.uuid()),
        // then
      ).rejects.toThrowError();
    });

    it('should update recipe if user is an author', async () => {
      // given
      jest.spyOn(recipesRepository, 'getOne').mockResolvedValue({
        ...recipe,
        rating: 0,
        isSaved: false,
        numberOfRatings: 3,
      });

      // when
      await recipesService.update(recipe.id, recipe, recipe.authorId);

      // then
      expect(recipesRepository.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should throw an error if recipe does not exist', async () => {
      // given
      jest.spyOn(recipesRepository, 'getOne').mockResolvedValue(null);

      // when
      expect(
        recipesService.remove(faker.string.uuid(), faker.string.uuid()),
        // then
      ).rejects.toThrowError();
    });

    it('should throw an error if user is not an author of the recipe', async () => {
      // given
      jest.spyOn(recipesRepository, 'getOne').mockResolvedValue({
        ...recipe,
        rating: 0,
        isSaved: false,
        numberOfRatings: 3,
      });

      // when
      expect(
        recipesService.remove(faker.string.uuid(), faker.string.uuid()),
        // then
      ).rejects.toThrowError();
    });

    it('should remove recipe if user is an author', async () => {
      // given
      jest.spyOn(recipesRepository, 'getOne').mockResolvedValue({
        ...recipe,
        rating: 0,
        isSaved: false,
        numberOfRatings: 3,
      });

      // when
      await recipesService.remove(faker.string.uuid(), recipe.authorId);

      // then
      expect(recipesRepository.remove).toHaveBeenCalled();
    });
  });
});
