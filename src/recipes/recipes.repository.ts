import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecipesRepository {
  constructor(private prisma: PrismaService) {}

  async getAll(userId?: string) {
    if (userId) {
      return await this.prisma.recipe.findMany({
        where: {
          OR: [
            {
              visibility: 'PUBLIC',
            },
            {
              visibility: 'PRIVATE',
              authorId: userId,
            },
          ],
        },
      });
    } else {
      return await this.prisma.recipe.findMany({
        where: {
          visibility: 'PUBLIC',
        },
      });
    }
  }
}
