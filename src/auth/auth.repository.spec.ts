import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';

describe('AuthRepository', () => {
  let prisma: PrismaService;
  let repository: AuthRepository;
  let jwt: JwtService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ConfigService, JwtService, AuthRepository],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    repository = module.get<AuthRepository>(AuthRepository);
    jwt = module.get<JwtService>(JwtService);
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

  describe('createSignUpRequest', () => {
    it('should create sign up request and return a validation token', async () => {
      jest.spyOn(prisma.signUpRequests, 'count').mockResolvedValue(0);
      jest.spyOn(jwt, 'sign').mockReturnValue('validation-token');
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'hashed-password');
      jest.spyOn(prisma.signUpRequests, 'create').mockResolvedValue({
        validation_token: 'validation-token',
        email: faker.internet.email(),
        password: 'hashed-password',
        createdAt: faker.date.anytime(),
      });

      const res = await repository.createSignUpRequest({
        email: faker.internet.email(),
        password: faker.internet.password(),
      });
      expect(res).toEqual('validation-token');
    });

    it('should throw an error if request for that email already exists', async () => {
      jest.spyOn(prisma.signUpRequests, 'count').mockResolvedValue(1);

      await expect(
        repository.createSignUpRequest({
          email: faker.internet.email(),
          password: faker.internet.password(),
        }),
      ).rejects.toEqual(
        new ConflictException(
          'Account sign up request for that email already exists.',
        ),
      );
    });
  });
});
