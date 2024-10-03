import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SavedRecipe, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersEmailsResponseDto } from './dto/users-email-reponse.dto';

@Injectable()
export class UsersRepository {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getEmails(): Promise<UsersEmailsResponseDto> {
    const emails = await this.prisma.user.findMany({
      select: {
        email: true,
      },
    });
    return { emails };
  }

  // Deprecated
  async register(user: CreateUserDto): Promise<UserDto> {
    const usersWithTheSameEmail = await this.prisma.user.count({
      where: {
        email: user.email,
      },
    });

    if (usersWithTheSameEmail > 0) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(
      user.password,
      +this.configService.get('BCRYPT_ROUNDS'),
    );

    const res = await this.prisma.user.create({
      data: {
        email: user.email,
        password: hashedPassword,
      },
    });

    const { password, ...userWithoutPassword } = res;
    return userWithoutPassword;
  }

  async confirmedRegister(user: CreateUserDto): Promise<UserDto> {
    const usersWithTheSameEmail = await this.prisma.user.count({
      where: {
        email: user.email,
      },
    });

    if (usersWithTheSameEmail > 0) {
      throw new ConflictException('Request already exists');
    }

    const res = await this.prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
      },
    });

    const { password, ...userWithoutPassword } = res;
    return userWithoutPassword;
  }

  async findOne(email: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    return user;
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      data: {
        password: newPassword,
      },
    });
  }

  findSavedRecipes(recipeId: string, userId: string): Promise<SavedRecipe> {
    return this.prisma.savedRecipe.findFirst({
      where: {
        recipeId,
        userId,
      },
    });
  }

  async removeFromSavedRecipes(
    recipeId: string,
    userId: string,
  ): Promise<void> {
    await this.prisma.savedRecipe.delete({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });
  }

  async addToSaved(recipeId: string, userId: string): Promise<void> {
    await this.prisma.savedRecipe.create({ data: { recipeId, userId } });
  }
}
