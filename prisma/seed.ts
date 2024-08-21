import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
  await prisma.user.upsert({
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
            title: faker.commerce.productName(),
            visibility: 'PUBLIC',
            image: faker.internet.url(),
          },
          {
            title: faker.commerce.productName(),
            visibility: 'PUBLIC',
            image: faker.internet.url(),
          },
          {
            title: faker.commerce.productName(),
            visibility: 'PRIVATE',
            image: faker.internet.url(),
          },
        ],
      },
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
      recipe: {
        create: [
          {
            title: faker.commerce.productName(),
            visibility: 'PUBLIC',
            image: faker.internet.url(),
          },
          {
            title: faker.commerce.productName(),
            visibility: 'PUBLIC',
            image: faker.internet.url(),
          },
          {
            title: faker.commerce.productName(),
            visibility: 'PRIVATE',
            image: faker.internet.url(),
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
