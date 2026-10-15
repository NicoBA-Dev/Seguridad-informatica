import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SupabaseModule } from './supabase/supabase.module.js';

// Equivalente estándar a __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolución segura de la carpeta frontend/dist
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
      exclude: ['/api/(.*)'],
    }),
    SupabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}