import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersRepository } from '../users/users.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { AuthRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { MailerService } from '@nestjs-modules/mailer';

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
        EmailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    jwt = module.get<JwtService>(JwtService);
    authRepository = module.get<AuthRepository>(AuthRepository);
  });

  describe('registerUser', () => {
    it('should call register function', async () => {
      // given
      const userDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      jest.spyOn(usersRepository, 'register').mockResolvedValue({
        id: faker.string.uuid(),
        ...userDto,
        createdAt: faker.date.anytime(),
      });

      // when
      await service.registerUser(userDto);

      //then
      expect(usersRepository.register).toHaveBeenCalledWith(userDto);
    });

    it('should return user data after registering', async () => {
      // given
      const userDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      jest.spyOn(usersRepository, 'register').mockResolvedValue({
        id: faker.string.uuid(),
        email: userDto.email,
        createdAt: faker.date.anytime(),
      });

      // when
      const data = await service.registerUser(userDto);

      // then
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
      // given
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(userData);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

      //when
      const res = await service.validateUser(userData.email, userData.password);

      //then
      expect(res).toEqual({
        id: expect.any(String),
        email: userData.email,
        createdAt: userData.createdAt,
      });
    });

    it('should return null if user was not found in database', async () => {
      // given
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      // when
      const res = await service.validateUser(userData.email, userData.password);

      // then
      expect(res).toBe(null);
    });

    it('should return null if passwords do not match', async () => {
      // given
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(userData);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      // when
      const res = await service.validateUser(userData.email, userData.password);

      // then
      expect(res).toBe(null);
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      // given
      const userDto = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        createdAt: faker.date.anytime(),
      };
      jest.spyOn(jwt, 'sign').mockReturnValue('jwt-encoded-string');

      // when
      const res = await service.login(userDto);
      // then
      expect(res).toEqual({ accessToken: 'jwt-encoded-string' });
    });
  });

  describe('createSignUpRequest', () => {
    it('should call addSignUpRequest function', async () => {
      // given
      jest.spyOn(authRepository, 'createSignUpRequest').mockResolvedValue();
      jest.spyOn(jwt, 'sign').mockReturnValue('jwt-encoded-string');
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'hashed-password');

      // when
      await service.createSignUpRequest({
        email: faker.internet.email(),
        password: faker.internet.password(),
      });

      // then
      expect(authRepository.createSignUpRequest).toHaveBeenCalled();
    });

    it('should throw an error if request for that email already exists in database', async () => {
      // given
      jest
        .spyOn(authRepository, 'countRequestsWithTheSameEmail')
        .mockResolvedValue(1);

      // when
      await expect(
        service.createSignUpRequest({
          email: faker.internet.email(),
          password: faker.internet.password(),
        }),

        // then
      ).rejects.toEqual(
        new ConflictException(
          'Account sign up request for that email already exists.',
        ),
      );
    });
  });

  describe('confirmUserRegistration', () => {
    it('should throw an error if user request does not exist in database', async () => {
      // given
      jest.spyOn(authRepository, 'find').mockResolvedValue(null);

      // when
      await expect(
        service.confirmUserRegistration({
          validationToken: 'validation_token',
          email: faker.internet.email(),
        }),
        // then
      ).rejects.toEqual(new NotFoundException('Request not found.'));
    });

    it('should throw an error if users validation token is invalid', async () => {
      // given
      const mockUserRequest = {
        validationToken: 'validation-token',
        email: faker.internet.email(),
        password: 'hashed-password',
        createdAt: faker.date.anytime(),
      };
      jest.spyOn(authRepository, 'find').mockResolvedValue(mockUserRequest);
      jest.spyOn(jwt, 'verify').mockReturnValue(null);

      // when
      await expect(
        service.confirmUserRegistration({
          email: faker.internet.email(),
          validationToken: 'validation-token',
        }),
        // then
      ).rejects.toThrow(new UnauthorizedException('Invalid token.'));
    });

    it('should return user data if user has been registered', async () => {
      // given
      const mockUserRequest = {
        validationToken: 'validation-token',
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
      // when
      await service.confirmUserRegistration({
        email: faker.internet.email(),
        validationToken: 'validation-token',
      });

      // then
      expect(usersRepository.confirmedRegister).toHaveBeenCalled();
    });
  });
});
