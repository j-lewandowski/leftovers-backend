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
      Recipe: {
        create: [
          {
            title: faker.commerce.productName(),
            visibility: 'PUBLIC',
          },
          {
            title: faker.commerce.productName(),
            visibility: 'PUBLIC',
          },
          {
            title: faker.commerce.productName(),
            visibility: 'PRIVATE',
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
      Recipe: {
        create: [
          {
            title: faker.commerce.productName(),
            visibility: 'PUBLIC',
          },
          {
            title: faker.commerce.productName(),
            visibility: 'PUBLIC',
          },
          {
            title: faker.commerce.productName(),
            visibility: 'PRIVATE',
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
