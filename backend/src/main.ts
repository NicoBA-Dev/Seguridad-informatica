import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global /api (coincide con tu api.ts del frontend)
  app.setGlobalPrefix('api');

  // CORS abierto y permisivo para el frontend en Render
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;

  // IMPORTANTE PARA RENDER: '0.0.0.0' como segundo parámetro
  await app.listen(port, '0.0.0.0');
  console.log(`Motor Criptográfico UPDS activo en el puerto ${port}`);
}

await bootstrap();