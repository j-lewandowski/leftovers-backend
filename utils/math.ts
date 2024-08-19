import { Rating } from '@prisma/client';

export const calculateAverageRating = (ratings: Rating[]) => {
  const totalRatings = ratings.length;
  const sumOfRatings = ratings.reduce((sum, rating) => sum + rating.value, 0);
  const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0;

  return averageRating;
};
