import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from './users.service';
import { faker } from '@faker-js/faker';

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
});
