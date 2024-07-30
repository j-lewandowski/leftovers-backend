import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersRepository } from '../users/users.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

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
              id: 'id',
              email: dto.email,
              createdAt: new Date(),
            })),
            findOne: jest.fn((email) => ({
              id: 'id',
              email,
              password: 'password',
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

  describe('validate', () => {
    it('should validate user', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue({
        id: 'id',
        email: 'email@email.com',
        password: 'password',
        createdAt: new Date(),
      });
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

      const res = await service.validateUser('email@email.com', 'password');
      expect(res).toEqual({
        id: 'id',
        email: 'email@email.com',
        createdAt: expect.any(Date),
      });
    });

    it('should return null if user was not found in database', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      const res = await service.validateUser('email@email.com', 'password');
      expect(res).toBe(null);
    });

    it('should return null if passwords do not match', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue({
        id: 'id',
        email: 'email@email.com',
        password: 'password',
        createdAt: new Date(),
      });
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);
      const res = await service.validateUser('email@email.com', 'password');
      expect(res).toBe(null);
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const userDto = {
        id: 'id',
        email: 'email@email.com',
        createdAt: new Date(),
      };
      jest.spyOn(jwt, 'sign').mockReturnValue('jwt-encoded-string');
      const res = await service.login(userDto);
      expect(res).toEqual({ access_token: 'jwt-encoded-string' });
    });
  });
});
