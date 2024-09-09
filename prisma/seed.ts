import { faker } from '@faker-js/faker';
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
            preparationTime: 'UP_TO_30_MIN',
            preparationSteps: ['Step 1'],
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
            categoryName: 'lunch',
            visibility: 'PUBLIC',
            servings: 2,
            image: faker.internet.url(),
          },
          {
            title: 'Spaghetti Carbonara',
            description:
              'This is a timeless Italian dish, showcasing perfectly cooked pasta...',
            preparationTime: 'UP_TO_30_MIN',
            preparationSteps: ['Step 1'],
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
            categoryName: 'lunch',
            visibility: 'PUBLIC',
            servings: 2,
            image: faker.internet.url(),
          },
          {
            title: 'Cheeseburger',
            description:
              'A perfectly grilled beef patty meets the creaminess of aged cheddar, all...',
            preparationTime: 'UP_TO_30_MIN',
            preparationSteps: ['Step 1'],
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
            categoryName: 'lunch',
            visibility: 'PUBLIC',
            servings: 2,
            image: faker.internet.url(),
          },
          {
            title: 'Garden Fresh Gourmet Salad',
            description:
              'A medley of farm-fresh greens, including crisp lettuce, peppery arag...',
            preparationTime: 'UP_TO_30_MIN',
            preparationSteps: ['Step 1'],
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
            categoryName: 'salads',
            visibility: 'PUBLIC',
            servings: 2,
            image: faker.internet.url(),
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
            preparationTime: 'UP_TO_30_MIN',
            preparationSteps: ['Step 1'],
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
            categoryName: 'soups',
            visibility: 'PRIVATE',
            servings: 2,
            image: faker.internet.url(),
          },
          {
            title: 'Garlic Butter Bliss Prawns',
            description:
              'Delight your senses with our Garlic Butter Bliss Prawns – a tantalizing...',
            preparationTime: 'UP_TO_30_MIN',
            preparationSteps: ['Step 1'],
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
            categoryName: 'lunch',
            visibility: 'PUBLIC',
            servings: 2,
            image: faker.internet.url(),
          },
          {
            title: 'Fluffy Vanilla Pancakes',
            description:
              'Elevate your breakfast experience with our Fluffy Vanilla Pancakes – a ...',
            preparationTime: 'UP_TO_30_MIN',
            preparationSteps: ['Step 1'],
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
            categoryName: 'breakfast',
            visibility: 'PUBLIC',
            servings: 2,
            image: faker.internet.url(),
          },
          {
            title: 'Tuna and Tomato Rice Bowl',
            description:
              'Dive into a culinary adventure with our Tuna and Avocado Rice Bowl – a...',
            preparationTime: 'UP_TO_30_MIN',
            preparationSteps: ['Step 1'],
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
            categoryName: 'lunch',
            visibility: 'PUBLIC',
            servings: 2,
            image: faker.internet.url(),
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
