import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
  const johnData = await prisma.user.upsert({
    where: {
      email: 'john@email.com',
    },
    update: {},
    create: {
      email: 'john@email.com',
      password: await bcrypt.hash('password', +process.env.BCRYPT_ROUNDS),
      recipe: {
        create: [
          {
            title: 'Grilled Chicken with Roasted Vegetables',
            description:
              'This grilled chicken is a breeze to make and delivers a delicious combo of flavors. Start by marinating chicken in a mix of zesty lemon, aromatic herbs, and garlic.',
            preparationTime: 'UpTo15Min',
            preparationSteps: ['Step 1'],
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
            categoryName: 'lunch',
            visibility: 'PUBLIC',
            servings: 2,
            imageKey: 'recipes/mockRecipes/chicken.png',
          },
          {
            title: 'Spaghetti Carbonara',
            description:
              'This is a timeless Italian dish, showcasing perfectly cooked pasta...',
            preparationTime: 'UpTo15Min',
            preparationSteps: ['Step 1'],
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
            categoryName: 'lunch',
            visibility: 'PUBLIC',
            servings: 2,
            imageKey: 'recipes/mockRecipes/carbonara.png',
          },
          {
            title: 'Cheeseburger',
            description:
              'A perfectly grilled beef patty meets the creaminess of aged cheddar, all...',
            preparationTime: 'UpTo15Min',
            preparationSteps: ['Step 1'],
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
            categoryName: 'lunch',
            visibility: 'PUBLIC',
            servings: 2,
            imageKey: 'recipes/mockRecipes/burger.png',
          },
          {
            title: 'Garden Fresh Gourmet Salad',
            description:
              'A medley of farm-fresh greens, including crisp lettuce, peppery arag...',
            preparationTime: 'UpTo15Min',
            preparationSteps: ['Step 1'],
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
            categoryName: 'salads',
            visibility: 'PUBLIC',
            servings: 2,
            imageKey: 'recipes/mockRecipes/salad.png',
          },
        ],
      },
    },
    include: {
      recipe: true,
    },
  });

  const janeData = await prisma.user.upsert({
    where: {
      email: 'jane@email.com',
    },
    update: {},
    create: {
      email: 'jane@email.com',
      password: await bcrypt.hash('password', +process.env.BCRYPT_ROUNDS),
      recipe: {
        create: [
          {
            title: 'Creamy Vegetable Soup 2',
            description:
              'Carrots, celery, and leeks mingle in a velvety broth, creating a symphonyo....',
            preparationTime: 'UpTo15Min',
            preparationSteps: ['Step 1'],
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
            categoryName: 'soups',
            visibility: 'PRIVATE',
            servings: 2,
            imageKey: 'recipes/mockRecipes/soup.png',
          },
          {
            title: 'Garlic Butter Bliss Prawns',
            description:
              'Delight your senses with our Garlic Butter Bliss Prawns – a tantalizing...',
            preparationTime: 'UpTo15Min',
            preparationSteps: ['Step 1'],
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
            categoryName: 'lunch',
            visibility: 'PUBLIC',
            servings: 2,
            imageKey: 'recipes/mockRecipes/prawns.png',
          },
          {
            title: 'Fluffy Vanilla Pancakes',
            description:
              'Elevate your breakfast experience with our Fluffy Vanilla Pancakes – a ...',
            preparationTime: 'UpTo15Min',
            preparationSteps: ['Step 1'],
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
            categoryName: 'breakfast',
            visibility: 'PUBLIC',
            servings: 2,
            imageKey: 'recipes/mockRecipes/pancakes.png',
          },
          {
            title: 'Tuna and Tomato Rice Bowl',
            description:
              'Dive into a culinary adventure with our Tuna and Avocado Rice Bowl – a...',
            preparationTime: 'UpTo15Min',
            preparationSteps: ['Step 1'],
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
            categoryName: 'lunch',
            visibility: 'PUBLIC',
            servings: 2,
            imageKey: 'recipes/mockRecipes/rice.png',
          },
        ],
      },
      rating: {
        create: [
          {
            value: 4,
            recipe: {
              connect: {
                id: johnData.recipe[0].id,
              },
            },
          },
          {
            value: 5,
            recipe: {
              connect: {
                id: johnData.recipe[1].id,
              },
            },
          },
          {
            value: 3,
            recipe: {
              connect: {
                id: johnData.recipe[2].id,
              },
            },
          },
        ],
      },
    },
    include: {
      recipe: true,
    },
  });

  await prisma.user.upsert({
    where: {
      email: 'jane@email.com',
    },
    update: {},
    create: {
      email: 'jane@email.com',
      password: await bcrypt.hash('password', +process.env.BCRYPT_ROUNDS),
      rating: {
        create: [
          {
            value: 3,
            recipe: {
              connect: {
                id: johnData.recipe[0].id,
              },
            },
          },
          {
            value: 2,
            recipe: {
              connect: {
                id: janeData.recipe[2].id,
              },
            },
          },
          {
            value: 5,
            recipe: {
              connect: {
                id: johnData.recipe[1].id,
              },
            },
          },
          {
            value: 2,
            recipe: {
              connect: {
                id: janeData.recipe[2].id,
              },
            },
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
