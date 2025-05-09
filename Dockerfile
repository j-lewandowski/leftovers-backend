FROM node:22.11.0-alpine
WORKDIR /app

COPY . .

RUN npm ci

RUN npx prisma generate

RUN npm run build

CMD ["npm", "run", "start:migrate:prod"]