import { Module } from '@nestjs/common';
import { UploadFileService } from 'src/upload-file/upload-file.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RecipesController } from './recipes.controller';
import { RecipesRepository } from './recipes.repository';
import { RecipesService } from './recipes.service';

@Module({
  imports: [PrismaModule],
  controllers: [RecipesController],
  providers: [RecipesService, RecipesRepository, UploadFileService],
})
export class RecipesModule {}
