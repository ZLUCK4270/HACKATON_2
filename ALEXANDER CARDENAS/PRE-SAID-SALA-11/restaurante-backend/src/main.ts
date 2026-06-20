import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir peticiones del navegador (localhost:3001)
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Restaurante API')
    .setDescription(
      'API REST del restaurante PRE-SAID · Sala 11 (platos, mesas, pedidos)',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
