import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersRepository } from '../users/users.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { AuthRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

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

  describe('addSignUpRequest', () => {
    it('should call addSignedUpRequest function', async () => {
      jest.spyOn(jwt, 'sign').mockReturnValue('jwt-encoded-string');
      jest.spyOn(authRepository, 'addSignUpRequest').mockResolvedValue({
        email: faker.internet.email(),
        password: faker.internet.password(),
        validation_token: 'jwt-encoded-string',
        createdAt: faker.date.anytime(),
      });

      await service.createSignUpRequest({
        email: faker.internet.email(),
        password: faker.internet.password(),
      });
      expect(authRepository.addSignUpRequest).toHaveBeenCalled();
    });
  });

  describe('confirmUserRegistration', () => {
    it('should return null if user request does not exist in database', async () => {
      jest.spyOn(authRepository, 'find').mockResolvedValue(null);

      const res = await service.confirmUserRegistration({
        email: faker.internet.email(),
        validation_token: 'validation-token',
      });
      expect(res).toEqual(null);
    });

    it('should return null if users token is not verified', async () => {
      const mockUserRequest = {
        validation_token: 'validation_token',
        email: faker.internet.email(),
        password: 'hashed-password',
        createdAt: faker.date.anytime(),
      };
      jest.spyOn(authRepository, 'find').mockResolvedValue(mockUserRequest);
      jest.spyOn(jwt, 'verify').mockReturnValue(null);

      const res = await service.confirmUserRegistration({
        email: faker.internet.email(),
        validation_token: 'validation-token',
      });
      expect(res).toEqual(null);
    });

    it('should return user data if users has been registered', async () => {
      const mockUserRequest = {
        validation_token: 'validation_token',
        email: faker.internet.email(),
        password: 'hashed-password',
        createdAt: faker.date.anytime(),
      };
      jest.spyOn(authRepository, 'find').mockResolvedValue(mockUserRequest);
      jest.spyOn(jwt, 'verify').mockReturnValue({});

      const res = await service.confirmUserRegistration({
        email: faker.internet.email(),
        validation_token: 'validation-token',
      });
      expect(res).toEqual(null);
    });
  });
});
