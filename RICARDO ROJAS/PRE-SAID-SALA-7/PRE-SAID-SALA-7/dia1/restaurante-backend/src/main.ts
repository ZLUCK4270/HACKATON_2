import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔥 CORS CORREGIDO PARA PRODUCCIÓN + LOCAL
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://pre-said-sala-7-six.vercel.app',
    ],
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API Restaurante')
    .setDescription('Documentación de la API del restaurante')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // PORT de Render
  const puerto = process.env.PORT || 3000;

  await app.listen(puerto);

  console.log(`Servidor corriendo en: http://localhost:${puerto}`);
  console.log(`Swagger disponible en: http://localhost:${puerto}/api`);
}

bootstrap();