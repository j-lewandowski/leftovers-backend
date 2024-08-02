import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RecipesRepository } from './recipes.repository';

@Module({
  imports: [PrismaModule],
  controllers: [RecipesController],
  providers: [RecipesService, RecipesRepository],
})
export class RecipesModule {}
