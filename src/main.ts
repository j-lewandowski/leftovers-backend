import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Leftovers API')
    .setDescription('Leftovers API documentation')
    .setVersion('1.0')
    .addBasicAuth()
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {});

  SwaggerModule.setup('/api', app, document, {
    swaggerOptions: {
      authAction: {
        'basic-auth': {
          name: 'basic-auth',
          schema: {
            type: 'http',
            in: 'header',
            scheme: 'basic',
          },
          value: 'Basic <base64-encoded-credentials>',
        },
        'jwt-auth': {
          schema: {
            type: 'http',
            in: 'header',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          value: 'Bearer <your-jwt-token>',
        },
      },
    },
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
