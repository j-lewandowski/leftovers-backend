import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Leftovers API')
    .setDescription('Leftovers API documentation')
    .setVersion('1.0')
    .addBasicAuth(
      {
        type: 'http',
        scheme: 'basic',
      },
      'basic-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {});
  SwaggerModule.setup('api', app, document, {
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
      },
    },
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen(3000);
}
bootstrap();
