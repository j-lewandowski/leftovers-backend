import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let repository: UsersRepository;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            getEmails: jest.fn(() => ({
              emails: [
                faker.internet.email(),
                faker.internet.email(),
                faker.internet.email(),
              ],
            })),
            updateSavedRecipes: jest.fn(),
            findSavedRecipes: jest.fn(),
            addToSavedRecipes: jest.fn(),
            removeFromSavedRecipes: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    service = module.get<UsersService>(UsersService);
  });

  describe('getEmails', () => {
    it('should call get emails function', async () => {
      // when
      await service.getEmails();

      // then
      expect(repository.getEmails).toHaveBeenCalled();
    });

    it("should return users' emails", async () => {
      // when
      const data = await service.getEmails();

      // then
      expect(data).toEqual({
        emails: [expect.any(String), expect.any(String), expect.any(String)],
      });
    });
  });

  describe('updateSaved', () => {
    it("should not add recipe to saved if it's already saved", async () => {
      // given
      const recipeId = faker.string.uuid();
      const userId = faker.string.uuid();
      jest.spyOn(repository, 'findSavedRecipes').mockResolvedValue({
        recipeId,
        userId,
      });

      // when
      await service.updateSavedRecipes({ recipeId, save: true }, userId);

      // then
      expect(repository.addToSavedRecipes).not.toHaveBeenCalled();
      expect(repository.removeFromSavedRecipes).not.toHaveBeenCalled();
    });

    it("should not remove recipe from saved if it's not saved", async () => {
      // given
      const recipeId = faker.string.uuid();
      const userId = faker.string.uuid();
      jest.spyOn(repository, 'findSavedRecipes').mockResolvedValue(null);

      // when
      await service.updateSavedRecipes({ recipeId, save: false }, userId);

      // then
      expect(repository.addToSavedRecipes).not.toHaveBeenCalled();
      expect(repository.removeFromSavedRecipes).not.toHaveBeenCalled();
    });

    it("should add recipe to saved if it's not saved", async () => {
      // given
      const recipeId = faker.string.uuid();
      const userId = faker.string.uuid();
      jest.spyOn(repository, 'findSavedRecipes').mockResolvedValue(null);

      // when
      await service.updateSavedRecipes({ recipeId, save: true }, userId);

      // then
      expect(repository.addToSavedRecipes).toHaveBeenCalled();
    });

    it("should remove recipe from saved if it's saved", async () => {
      // given
      const recipeId = faker.string.uuid();
      const userId = faker.string.uuid();
      jest.spyOn(repository, 'findSavedRecipes').mockResolvedValue({
        recipeId,
        userId,
      });

      // when
      await service.updateSavedRecipes({ recipeId, save: false }, userId);

      // then
      expect(repository.removeFromSavedRecipes).toHaveBeenCalled();
    });
  });
});
