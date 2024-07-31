import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersRepository } from '../users/users.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { AuthRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: UsersRepository;
  let authRepository: AuthRepository;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        AuthService,
        JwtService,
        UsersRepository,
        AuthRepository,
        ConfigService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    jwt = module.get<JwtService>(JwtService);
    authRepository = module.get<AuthRepository>(AuthRepository);
  });

  describe('registerUser', () => {
    it('should call register function', async () => {
      const userDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      jest.spyOn(usersRepository, 'register').mockResolvedValue({
        id: faker.string.uuid(),
        ...userDto,
        createdAt: faker.date.anytime(),
      });

      await service.registerUser(userDto);

      expect(usersRepository.register).toHaveBeenCalledWith(userDto);
    });

    it('should return user data after registering', async () => {
      const userDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      jest.spyOn(usersRepository, 'register').mockResolvedValue({
        id: faker.string.uuid(),
        email: userDto.email,
        createdAt: faker.date.anytime(),
      });

      const data = await service.registerUser(userDto);

      expect(data).toEqual({
        id: expect.any(String),
        email: userDto.email,
        createdAt: expect.any(Date),
      });
    });
  });

  describe('validate', () => {
    const userData = {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      createdAt: faker.date.anytime(),
    };

    it('should validate user', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(userData);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

      const res = await service.validateUser(userData.email, userData.password);
      expect(res).toEqual({
        id: expect.any(String),
        email: userData.email,
        createdAt: userData.createdAt,
      });
    });

    it('should return null if user was not found in database', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      const res = await service.validateUser(userData.email, userData.password);
      expect(res).toBe(null);
    });

    it('should return null if passwords do not match', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(userData);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);
      const res = await service.validateUser(userData.email, userData.password);
      expect(res).toBe(null);
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const userDto = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        createdAt: faker.date.anytime(),
      };
      jest.spyOn(jwt, 'sign').mockReturnValue('jwt-encoded-string');
      const res = await service.login(userDto);
      expect(res).toEqual({ access_token: 'jwt-encoded-string' });
    });
  });

  describe('createSignUpRequest', () => {
    it('should call addSignUpRequest function', async () => {
      jest
        .spyOn(authRepository, 'createSignUpRequest')
        .mockResolvedValue('validation-token');

      await service.createSignUpRequest({
        email: faker.internet.email(),
        password: faker.internet.password(),
      });
      expect(authRepository.createSignUpRequest).toHaveBeenCalled();
    });
  });

  describe('confirmUserRegistration', () => {
    it('should throw an error if user request does not exist in database', async () => {
      jest.spyOn(authRepository, 'find').mockResolvedValue(null);

      await expect(
        service.confirmUserRegistration({
          validation_token: 'validation_token',
          email: faker.internet.email(),
        }),
      ).rejects.toEqual(new NotFoundException('Request not found.'));
    });

    it('should throw an error if users validation token is invalid', async () => {
      const mockUserRequest = {
        validation_token: 'validation-token',
        email: faker.internet.email(),
        password: 'hashed-password',
        createdAt: faker.date.anytime(),
      };
      jest.spyOn(authRepository, 'find').mockResolvedValue(mockUserRequest);
      jest.spyOn(jwt, 'verify').mockReturnValue(null);
      await expect(
        service.confirmUserRegistration({
          email: faker.internet.email(),
          validation_token: 'validation-token',
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid token.'));
    });

    it('should return user data if users has been registered', async () => {
      const mockUserRequest = {
        validation_token: 'validation-token',
        email: faker.internet.email(),
        password: 'hashed-password',
        createdAt: faker.date.anytime(),
      };
      jest.spyOn(authRepository, 'find').mockResolvedValue(mockUserRequest);
      jest.spyOn(jwt, 'verify').mockReturnValue({});
      jest.spyOn(usersRepository, 'confirmedRegister').mockResolvedValue({
        id: faker.string.uuid(),
        email: faker.internet.email(),
        createdAt: faker.date.anytime(),
      });

      await service.confirmUserRegistration({
        email: faker.internet.email(),
        validation_token: 'validation-token',
      });
      expect(usersRepository.confirmedRegister).toHaveBeenCalled();
    });
  });
});
