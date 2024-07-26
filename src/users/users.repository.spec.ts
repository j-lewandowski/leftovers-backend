import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from '../users/users.repository';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('UsersRepository', () => {
  let repository: UsersRepository;

  const prismaMockService = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: PrismaService,
          useValue: prismaMockService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: () => 10,
          },
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  describe('register', () => {
    it('should return user data after registering', async () => {
      const userDto = {
        email: 'email@email.com',
        password: 'password',
      };

      prismaMockService.user.create.mockResolvedValue({
        id: 'id',
        email: 'email@email.com',
        createdAt: new Date(),
      });

      const res = await prismaMockService.user.create(userDto);

      expect(res).toEqual({
        id: 'id',
        email: userDto.email,
        createdAt: expect.any(Date),
      });
    });
  });

  it('should throw an error if user with the same email already exists', async () => {
    const userDto = {
      email: 'email@email.com',
      password: 'password',
    };

    prismaMockService.user.create.mockResolvedValueOnce({
      id: 'id',
      email: 'email@email.com',
      createdAt: new Date(),
    });

    await repository.register(userDto);

    prismaMockService.user.create.mockRejectedValueOnce(
      new Error('User with this email already exists'),
    );

    await expect(repository.register(userDto)).rejects.toThrow(
      'User with this email already exists',
    );
  });
});
