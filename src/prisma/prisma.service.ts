import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClientExtended } from './prisma.extenstion';

@Injectable()
export class PrismaService
  extends PrismaClientExtended
  implements OnModuleInit
{
  async onModuleInit() {
    await this.$connect();
  }

  async clearDatabase() {
    return this.$transaction([
      this.rating.deleteMany({}),
      this.savedRecipe.deleteMany({}),
      this.recipeOfTheDay.deleteMany({}),
      this.recipe.deleteMany({}),
      this.user.deleteMany({}),
      this.signUpRequests.deleteMany({}),
      this.resetPasswordRequest.deleteMany({}),
    ]);
  }
}
