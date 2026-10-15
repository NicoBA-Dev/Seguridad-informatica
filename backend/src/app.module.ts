import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SupabaseModule } from './supabase/supabase.module.js';

// Detección robusta de la ruta del frontend compilado (dist)
const possibleFrontendPaths = [
  resolve(process.cwd(), '../frontend/dist'),
  resolve(process.cwd(), 'frontend/dist'),
  resolve(__dirname, '../../frontend/dist'),
];
const frontendDistPath =
  possibleFrontendPaths.find((path) => existsSync(path)) ||
  resolve(process.cwd(), '../frontend/dist');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
    }),
    ServeStaticModule.forRoot({
      rootPath: frontendDistPath,
      exclude: ['/api/(.*)'], // No interceptar las rutas del controlador NestJS
    }),
    SupabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }