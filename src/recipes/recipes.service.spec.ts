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
            getOne: jest.fn(),
            create: jest.fn(),
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
    preparationTime: PreparationTime.UP_TO_15_MIN,
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
        },
        {
          id: 'recipe2',
          title: 'Omelette',
          description: 'description',
          rating: 3.0,
          imageKey: 'image/key',
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
        },
        {
          id: 'recipe2',
          title: 'Omelette',
          description: 'description',
          rating: 3.0,
          imageUrl: expect.any(String),
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return a recipe with caluclated rating', async () => {
      // given
      jest
        .spyOn(recipesRepository, 'getOne')
        .mockResolvedValue({ ...recipe, rating: 0 });
      jest
        .spyOn(uploadFileService, 'getImageUrl')
        .mockResolvedValue(faker.internet.url());

      // when
      const res = await recipesService.findOne(
        faker.string.uuid(),
        faker.string.uuid(),
      );
      const { rating: _r, imageKey: _i, ...otherFields } = recipe;
      // then
      expect(res).toEqual({
        ...otherFields,
        rating: 0,
        imageUrl: expect.any(String),
      });
    });

    it('should throw forbidden error if recipe is private and user is not an author', async () => {
      // given
      jest.spyOn(recipesRepository, 'getOne').mockResolvedValue({
        ...recipe,
        visibility: Visibility.PRIVATE,
        rating: 0,
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
});
