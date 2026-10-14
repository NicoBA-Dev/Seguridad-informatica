import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date() };
  }

  // Auth: Registro
  @Post('auth/register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('nombre') nombre: string,
    @Body('ci') ci: string,
  ) {
    if (!email || !password || !nombre) {
      throw new BadRequestException('Faltan campos obligatorios');
    }
    return this.appService.registerUser(email, password, nombre, ci);
  }

  // Auth: Login
  @Post('auth/login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    if (!email || !password) {
      throw new BadRequestException('Correo y contraseña requeridos');
    }
    return this.appService.loginUser(email, password);
  }

  // Generar par de llaves
  @Post('keys/generate')
  async generateKeys(@Body('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('Se requiere el userId');
    }
    return this.appService.generateKeyPair(userId);
  }

  // Firmar PDF
  @Post('pdf/sign')
  @UseInterceptors(FileInterceptor('file'))
  async signPdf(
    @UploadedFile() file: any,
    @Body('privateKey') privateKey: string,
    @Body('userId') userId: string,
  ) {
    if (!file) throw new BadRequestException('Se requiere el archivo PDF');
    if (!privateKey) throw new BadRequestException('Se requiere la llave privada');
    if (!userId) throw new BadRequestException('Se requiere el userId');

    return this.appService.signPdf(file.buffer, file.originalname, privateKey, userId);
  }

  // Verificar PDF
  @Post('pdf/verify')
  @UseInterceptors(FileInterceptor('file'))
  async verifyPdf(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('Se requiere el archivo PDF');
    return this.appService.verifyPdf(file.buffer);
  }
}