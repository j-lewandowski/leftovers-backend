import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { AuthRepository } from './auth.repository';

describe('AuthRepository', () => {
  let prisma: PrismaService;
  let repository: AuthRepository;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ConfigService, AuthRepository],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    repository = module.get<AuthRepository>(AuthRepository);
  });

  describe('find', () => {
    it('should return sign up request data', async () => {
      const mockSignUpRequestData = {
        validation_token: faker.string.uuid(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        createdAt: faker.date.anytime(),
      };

      jest
        .spyOn(prisma.signUpRequests, 'findFirst')
        .mockResolvedValue(mockSignUpRequestData);

      const res = await repository.find(faker.string.uuid());
      expect(res).toEqual(mockSignUpRequestData);
    });
  });

  describe('addSignUpRequest', () => {
    it('should create sign up request', async () => {
      const mockSignUpRequestData = {
        validation_token: faker.string.uuid(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      jest.spyOn(prisma.signUpRequests, 'create').mockResolvedValue({
        ...mockSignUpRequestData,
        createdAt: faker.date.anytime(),
      });

      const res = await repository.addSignUpRequest(mockSignUpRequestData);
      expect(res).toEqual({
        ...mockSignUpRequestData,
        createdAt: expect.any(Date),
      });
    });
  });
});
