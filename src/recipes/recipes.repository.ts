import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetRecepiesFiltersDto } from './dto/get-recepies-filter.dto';

@Injectable()
export class RecipesRepository {
  constructor(private prisma: PrismaService) {}

  async getAll(userId?: string, params?: GetRecepiesFiltersDto) {
    const where: any = {};
    const select: any = {};

    if (userId) {
      where.OR = [
        {
          visibility: 'PUBLIC',
        },
        {
          visibility: 'PRIVATE',
          author_id: userId,
        },
      ];
    } else {
      where.visibility = 'PUBLIC';
    }

    if (params.category) {
      where.category = {
        name: {
          in: params.category,
        },
      };
    }

    if (params.rating) {
      where.avgRating = {
        gte: params.rating,
      };
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) {
        where.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.lte = new Date(params.endDate);
      }
    }

    console.log(where);

    return await this.prisma.recipe.findMany({
      where,
      select: {
        ...select,
        avgRating: {
          select: {
            _avg: {
              rating: true,
            },
          },
        },
      },
    });
  }
}
