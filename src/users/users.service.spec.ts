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
                'email1@email.com',
                'email2@email.com',
                'email3@email.com',
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
      await service.getEmails();

      expect(repository.getEmails).toHaveBeenCalled();
    });

    it("should return users' emails", async () => {
      const data = await service.getEmails();

      expect(data).toEqual({
        emails: ['email1@email.com', 'email2@email.com', 'email3@email.com'],
      });
    });
  });
});
