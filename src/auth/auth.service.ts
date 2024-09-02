import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDto } from '../users/dto/user.dto';
import { UsersRepository } from '../users/users.repository';
import { AuthRepository } from './auth.repository';
import { AccessTokenDto } from './dto/access-token.dto';
import { ConfirmSignUpDto } from './dto/confirm-sign-up.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private authRepository: AuthRepository,
    private emailService: EmailService,
  ) {}

  /** @deprecated Use createSignUpRequest method instead */
  registerUser(user: CreateUserDto): Promise<UserDto> {
    return this.usersRepository.register(user);
  }

  async validateUser(email: string, password: string): Promise<UserDto> {
    const user = await this.usersRepository.findOne(email);
    if (!user) {
      return null;
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      return null;
    }

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(user: UserDto): Promise<AccessTokenDto> {
    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async createSignUpRequest(user: CreateUserDto): Promise<void> {
    const requestsWithTheSameEmail =
      await this.authRepository.countRequestsWithTheSameEmail(user.email);

    if (requestsWithTheSameEmail > 0) {
      throw new ConflictException(
        'Account sign up request for that email already exists.',
      );
    }

    const validationToken = this.jwtService.sign({ email: user.email });
    const hashedPassword = await bcrypt.hash(
      user.password,
      +this.configService.get('BCRYPT_ROUNDS'),
    );

    await this.authRepository.createSignUpRequest({
      email: user.email,
      password: hashedPassword,
      validationToken,
    });

    this.emailService.sendAccountConfirmationMail(user.email, validationToken);
  }

  async confirmUserRegistration(requestData: ConfirmSignUpDto): Promise<void> {
    const userRequest = await this.authRepository.find(requestData.email);
    if (!userRequest) {
      throw new NotFoundException('Request not found.');
    }
    const isTokenValid = this.jwtService.verify(requestData.validationToken);
    if (
      !isTokenValid ||
      requestData.validationToken !== userRequest.validationToken
    ) {
      throw new UnauthorizedException('Invalid token.');
    }

    await this.usersRepository.confirmedRegister({
      email: userRequest.email,
      password: userRequest.password,
    });
  }

  async createResetPasswordRequest(email: string): Promise<void> {
    const user = await this.usersRepository.findOne(email);
    if (!user) {
      return;
    }

    const validationToken = this.jwtService.sign({ email });
    await this.authRepository.createResetPasswordRequest(
      email,
      validationToken,
    );

    await this.emailService.sendPasswordResetMail(email, validationToken);
  }

  async resetPassword({
    newPassword,
    validationToken,
  }: ResetPasswordDto): Promise<void> {
    try {
      const { email } = this.jwtService.verify(validationToken);
      const newPasswordHashed = await bcrypt.hash(
        newPassword,
        +this.configService.get('BCRYPT_ROUNDS'),
      );

      await this.usersRepository.updatePassword(email, newPasswordHashed);
    } catch (error) {
      throw new UnauthorizedException('Invalid token.');
    }
  }
}
