import { Injectable } from '@nestjs/common';
import { SaveRecipeDto } from './dto/save-recipe.dto';
import { UsersEmailsResponseDto } from './dto/users-email-reponse.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  getEmails(): Promise<UsersEmailsResponseDto> {
    return this.usersRepository.getEmails();
  }

  async updateSavedRecipes(
    updateData: SaveRecipeDto,
    userId: string,
  ): Promise<void> {
    const savedRecipe = await this.usersRepository.findSavedRecipes(
      updateData.recipeId,
      userId,
    );

    if (
      (savedRecipe && updateData.save) ||
      (!savedRecipe && !updateData.save)
    ) {
      return;
    }

    if (updateData.save) {
      await this.usersRepository.addToSavedRecipes(updateData.recipeId, userId);
    } else {
      await this.usersRepository.removeFromSavedRecipes(
        updateData.recipeId,
        userId,
      );
    }
  }
}
