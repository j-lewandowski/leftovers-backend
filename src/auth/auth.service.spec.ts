import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersRepository } from '../users/users.repository';

describe('AuthService', () => {
  let service: AuthService;
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: {
            register: jest.fn((dto) => ({
              id: 'id',
              email: dto.email,
              createdAt: new Date(),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  describe('register', () => {
    it('should call register function', async () => {
      const userDto = {
        email: 'email@email.com',
        password: 'password',
      };

      await service.registerUser(userDto);

      expect(repository.register).toHaveBeenCalledWith(userDto);
    });

    it('should return user data after registering', async () => {
      const userDto = {
        email: 'email@email.com',
        password: 'password',
      };

      const data = await service.registerUser(userDto);

      expect(data).toEqual({
        id: 'id',
        email: userDto.email,
        createdAt: expect.any(Date),
      });
    });
  });
});
