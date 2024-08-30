import { faker } from '@faker-js/faker';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthRepository } from './auth.repository';

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
      // given
      const mockSignUpRequestData = {
        validationToken: faker.string.uuid(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        createdAt: faker.date.anytime(),
      };

      jest
        .spyOn(prisma.signUpRequests, 'findFirst')
        .mockResolvedValue(mockSignUpRequestData);

      // when
      const res = await repository.find(faker.string.uuid());

      // then
      expect(res).toEqual(mockSignUpRequestData);
    });
  });

  describe('createSignUpRequest', () => {
    it('should create sign up request', async () => {
      // given
      jest.spyOn(prisma.signUpRequests, 'count').mockResolvedValue(0);
      jest.spyOn(jwt, 'sign').mockReturnValue('validation-token');
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'hashed-password');
      jest.spyOn(prisma.signUpRequests, 'create').mockResolvedValue({
        validationToken: 'validation-token',
        email: faker.internet.email(),
        password: 'hashed-password',
        createdAt: faker.date.anytime(),
      });

      // when
      await repository.createSignUpRequest({
        email: faker.internet.email(),
        password: faker.internet.password(),
        validationToken: 'validation-token',
      });

      // then
      expect(prisma.signUpRequests.create).toHaveBeenCalled();
    });
  });

  describe('createResetPasswordRequest', () => {
    it('should create reset password request', async () => {
      // given
      jest.spyOn(prisma.resetPasswordRequest, 'create').mockResolvedValue({
        validationToken: 'jwt-token',
        email: faker.internet.email(),
      });

      // when
      await repository.createResetPasswordRequest(
        faker.internet.email(),
        'jwt-token',
      );

      // then
      expect(prisma.resetPasswordRequest.create).toHaveBeenCalled();
    });
  });
});
