import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from '../users/users.repository';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { faker } from '@faker-js/faker';

describe('UsersRepository', () => {
  let repository: UsersRepository;

  const prismaMockService = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
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
    const userDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    it('should return user data after registering', async () => {
      // given
      prismaMockService.user.create.mockResolvedValue({
        id: faker.string.uuid(),
        ...userDto,
        createdAt: new Date(),
      });

      // when
      const res = await repository.register(userDto);

      // then
      expect(res).toEqual({
        id: expect.any(String),
        email: userDto.email,
        createdAt: expect.any(Date),
      });
    });

    it('should throw an error if user with the same email already exists', async () => {
      // given
      prismaMockService.user.create.mockResolvedValueOnce({
        id: faker.string.uuid(),
        ...userDto,
        createdAt: faker.date.anytime,
      });

      // when
      await repository.register(userDto);

      prismaMockService.user.create.mockRejectedValueOnce(
        new Error('User with this email already exists'),
      );

      // then
      await expect(repository.register(userDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });

  describe('confirmedRegister', () => {
    const userDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    it('should return user data after registering', async () => {
      // given
      prismaMockService.user.create.mockResolvedValue({
        id: faker.string.uuid(),
        ...userDto,
        createdAt: new Date(),
      });

      // when
      const res = await repository.confirmedRegister(userDto);

      // then
      expect(res).toEqual({
        id: expect.any(String),
        email: userDto.email,
        createdAt: expect.any(Date),
      });
    });

    it('should throw an error if user with the same email already exists', async () => {
      // given
      prismaMockService.user.create.mockResolvedValueOnce({
        id: faker.string.uuid(),
        ...userDto,
        createdAt: faker.date.anytime,
      });

      // when
      await repository.confirmedRegister(userDto);

      prismaMockService.user.create.mockRejectedValueOnce(
        new Error('User with this email already exists'),
      );

      // then
      await expect(repository.confirmedRegister(userDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });

  describe('findOne', () => {
    it('should return a user if user exists in database', async () => {
      // given
      const mockReuslt = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        createdAt: faker.date.anytime(),
      };
      jest
        .spyOn(prismaMockService.user, 'findFirst')
        .mockResolvedValue(mockReuslt);

      // when
      const res = await repository.findOne('email@email.com');

      // then
      expect(res).toEqual(mockReuslt);
    });

    it('should return null if user does not exist in database', async () => {
      // given
      jest.spyOn(prismaMockService.user, 'findFirst').mockResolvedValue(null);

      // when
      const res = await repository.findOne('nonexistingemail@email.com');

      // then
      expect(res).toEqual(null);
    });
  });
});
