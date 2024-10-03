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
            findSaved: jest.fn(),
            addToSaved: jest.fn(),
            removeFromSaved: jest.fn(),
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
      jest.spyOn(repository, 'findSaved').mockResolvedValue({
        recipeId,
        userId,
      });

      // when
      await service.updateSavedRecipes({ recipeId, save: true }, userId);

      // then
      expect(repository.addToSaved).not.toHaveBeenCalled();
      expect(repository.removeFromSaved).not.toHaveBeenCalled();
    });

    it("should not remove recipe from saved if it's not saved", async () => {
      // given
      const recipeId = faker.string.uuid();
      const userId = faker.string.uuid();
      jest.spyOn(repository, 'findSaved').mockResolvedValue(null);

      // when
      await service.updateSavedRecipes({ recipeId, save: false }, userId);

      // then
      expect(repository.addToSaved).not.toHaveBeenCalled();
      expect(repository.removeFromSaved).not.toHaveBeenCalled();
    });

    it("should add recipe to saved if it's not saved", async () => {
      // given
      const recipeId = faker.string.uuid();
      const userId = faker.string.uuid();
      jest.spyOn(repository, 'findSaved').mockResolvedValue(null);

      // when
      await service.updateSavedRecipes({ recipeId, save: true }, userId);

      // then
      expect(repository.addToSaved).toHaveBeenCalled();
    });

    it("should remove recipe from saved if it's saved", async () => {
      // given
      const recipeId = faker.string.uuid();
      const userId = faker.string.uuid();
      jest.spyOn(repository, 'findSaved').mockResolvedValue({
        recipeId,
        userId,
      });

      // when
      await service.updateSavedRecipes({ recipeId, save: false }, userId);

      // then
      expect(repository.removeFromSaved).toHaveBeenCalled();
    });
  });
});
