import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersRepository } from '../users/repositories/users.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

describe('AuthService', () => {
  let service: AuthService;
  let repository: UsersRepository;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: UsersRepository,
          useValue: {
            register: jest.fn((dto) => ({
              id: faker.string.uuid(),
              email: dto.email,
              createdAt: new Date(),
            })),
            findOne: jest.fn((email) => ({
              id: faker.string.uuid(),
              email,
              password: faker.internet.password(),
              createdAt: new Date(),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get<UsersRepository>(UsersRepository);
    jwt = module.get<JwtService>(JwtService);
  });

  describe('registerUser', () => {
    it('should call register function', async () => {
      const userDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      await service.registerUser(userDto);

      expect(repository.register).toHaveBeenCalledWith(userDto);
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
      jest.spyOn(repository, 'findOne').mockResolvedValue(userData);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

      const res = await service.validateUser(userData.email, userData.password);
      expect(res).toEqual({
        id: expect.any(String),
        email: userData.email,
        createdAt: userData.createdAt,
      });
    });

    it('should return null if user was not found in database', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      const res = await service.validateUser(userData.email, userData.password);
      expect(res).toBe(null);
    });

    it('should return null if passwords do not match', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(userData);
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
});
