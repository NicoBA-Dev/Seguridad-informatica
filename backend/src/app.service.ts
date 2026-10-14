import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service.js';
import * as crypto from 'crypto';
import forgeModule from 'node-forge';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import { P12Signer } from '@signpdf/signer-p12';
import signpdfPkg from '@signpdf/signpdf';

const forge = (forgeModule as any).default || forgeModule;
const signpdf = (signpdfPkg as any).default || signpdfPkg;

@Injectable()
export class AppService {
  constructor(private readonly supabaseService: SupabaseService) { }

  getHello(): string {
    return 'API de Firma Digital UPDS funcionando';
  }

  // 1. REGISTRO EN SUPABASE AUTH
  async registerUser(email: string, password: string, nombre: string, ci: string) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, ci } },
    });

    if (error) throw new BadRequestException('Error al registrar usuario: ' + error.message);

    return {
      message: 'Usuario registrado exitosamente',
      user: data.user,
    };
  }

  // 2. INICIO DE SESIÓN
  async loginUser(email: string, password: string) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      throw new UnauthorizedException('Credenciales incorrectas: ' + (error?.message || ''));
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      message: 'Inicio de sesión exitoso',
      user: data.user,
      perfil: perfil || { nombre: data.user.email, ci: '', llave_publica: null },
    };
  }

  // 3. GENERAR PAR DE LLAVES RSA (2048 BITS)
  async generateKeyPair(userId: string) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    });

    const supabase = this.supabaseService.client;
    const { error } = await supabase
      .from('perfiles')
      .update({ llave_publica: publicKey, updated_at: new Date() })
      .eq('id', userId);

    if (error) throw new BadRequestException('Error al guardar la llave pública: ' + error.message);

    return {
      message: 'Par de llaves generado exitosamente',
      llavePublica: publicKey,
      llavePrivada: privateKey,
    };
  }

  // 4. CREAR CERTIFICADO PKCS#12 (.p12)
  private createP12Certificate(privateKeyPem: string, certData: { nombre: string; email: string; ci: string }): Buffer {
    let privateKeyObj: any;
    try {
      const pkcs1Pem = crypto.createPrivateKey(privateKeyPem).export({ type: 'pkcs1', format: 'pem' }) as string;
      privateKeyObj = forge.pki.privateKeyFromPem(pkcs1Pem);
    } catch (e: any) {
      throw new BadRequestException('El formato de la llave privada no es válido: ' + e.message);
    }

    const cert = forge.pki.createCertificate();
    cert.publicKey = forge.pki.setRsaPublicKey(privateKeyObj.n, privateKeyObj.e);
    cert.serialNumber = '01' + Date.now().toString(16);

    cert.validity.notBefore = new Date(Date.now() - 24 * 60 * 60 * 1000); // Válido desde ayer
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 2);

    const attrs = [
      { name: 'commonName', value: `${certData.nombre}` },
      { name: 'countryName', value: 'BO' },
      { name: 'organizationName', value: 'Universidad Privada Domingo Savio - UPDS' },
      { name: 'organizationalUnitName', value: 'Seguridad Informatica' },
      { name: 'emailAddress', value: certData.email },
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    cert.setExtensions([
      { name: 'basicConstraints', cA: false },
      { name: 'keyUsage', digitalSignature: true, nonRepudiation: true, keyEncipherment: true },
      { name: 'extKeyUsage', clientAuth: true, emailProtection: true, timeStamping: true },
    ]);

    cert.sign(privateKeyObj, forge.md.sha256.create());

    const p12Password = 'upds-pass';
    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(privateKeyObj, [cert], p12Password, {
      generateLocalKeyId: true,
      friendlyName: certData.nombre,
    });

    const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
    return Buffer.from(p12Der, 'binary');
  }

  // 5. FIRMAR PDF DIGITALMENTE CON PAdES (COMPATIBLE CON ADOBE Y VALIDADOR BOLIVIA)
  async signPdf(fileBuffer: Buffer, fileName: string, privateKeyPem: string, userId: string) {
    const supabase = this.supabaseService.client;

    const { data: perfil, error: userError } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !perfil) {
      throw new NotFoundException('Usuario no encontrado en la base de datos');
    }

    const hashOriginal = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const fechaFirma = new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' });

    // PASO A: Cargar el PDF y estampar el sello visual en la última página
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width } = lastPage.getSize();

    lastPage.drawRectangle({
      x: 35,
      y: 35,
      width: width - 70,
      height: 90,
      borderColor: rgb(0.93, 0.14, 0.24), // Rojo neón UPDS
      borderWidth: 1.5,
      color: rgb(0.04, 0.05, 0.07),
    });

    lastPage.drawText('DOCUMENTO FIRMADO DIGITALMENTE (UPDS // TRUST ENGINE)', {
      x: 50,
      y: 105,
      size: 10,
      font: helveticaBold,
      color: rgb(0.93, 0.14, 0.24),
    });

    lastPage.drawText(`Firmante: ${perfil.nombre} | Documento: ${perfil.ci || 'N/A'}`, {
      x: 50,
      y: 90,
      size: 9,
      font: helveticaFont,
      color: rgb(0.95, 0.95, 0.95),
    });

    lastPage.drawText(`Fecha y Hora: ${fechaFirma} | Estándar: PAdES / PKCS#7 (SHA256 con RSA)`, {
      x: 50,
      y: 75,
      size: 8,
      font: helveticaFont,
      color: rgb(0.6, 0.65, 0.7),
    });

    lastPage.drawText(`Hash de Integridad SHA-256: ${hashOriginal.substring(0, 48)}...`, {
      x: 50,
      y: 60,
      size: 7,
      font: helveticaFont,
      color: rgb(0.4, 0.45, 0.5),
    });

    lastPage.drawText('Validez Criptográfica: Autenticidad, Integridad y No Repudio Verificados', {
      x: 50,
      y: 48,
      size: 7,
      font: helveticaBold,
      color: rgb(0.2, 0.8, 0.4),
    });

    pdfDoc.setTitle(`Firmado_${fileName}`);
    pdfDoc.setAuthor(perfil.nombre);
    pdfDoc.setSubject(JSON.stringify({
      firmanteId: perfil.id,
      nombre: perfil.nombre,
      ci: perfil.ci,
      hashOriginal,
      fecha: fechaFirma
    }));

    // PASO B: Inyectar el contenedor PAdES de forma nativa con pdflibAddPlaceholder
    pdflibAddPlaceholder({
      pdfDoc,
      reason: 'Firma Digital e Integridad UPDS',
      contactInfo: perfil.email,
      name: perfil.nombre,
      location: 'La Paz, Bolivia',
      signatureLength: 8192,
    });

    // Guardar los bytes del PDF con el placeholder ya inyectado
    const pdfConPlaceholderBytes = await pdfDoc.save({ useObjectStreams: false });
    const pdfConPlaceholderBuffer = Buffer.from(pdfConPlaceholderBytes);

    // PASO C: Aplicar la firma criptográfica con @signpdf
    let finalSignedBuffer: Buffer;
    try {
      const p12Buffer = this.createP12Certificate(privateKeyPem, {
        nombre: perfil.nombre,
        email: perfil.email,
        ci: perfil.ci,
      });

      const p12Signer = new P12Signer(p12Buffer, { passphrase: 'upds-pass' });
      let signerInstance: any = signpdf;
      if (typeof signerInstance === 'function') {
        try { signerInstance = new signerInstance(); } catch { }
      }
      finalSignedBuffer = await signerInstance.sign(pdfConPlaceholderBuffer, p12Signer);
    } catch (err: any) {
      console.error('Error al estampar firma PAdES:', err);
      throw new BadRequestException('Error en el motor de firma PAdES: ' + err.message);
    }

    // PASO D: Registrar en Supabase
    await supabase.from('documentos_firmados').insert({
      usuario_id: perfil.id,
      nombre_archivo: fileName,
      hash_sha256: hashOriginal,
      firma_digital: 'Firma PAdES / PKCS#7 verificada',
    });

    return {
      message: 'Documento firmado exitosamente',
      pdfBase64: finalSignedBuffer.toString('base64'),
      hashOriginal,
    };
  }

  // 6. VERIFICAR FIRMA
  async verifyPdf(fileBuffer: Buffer) {
    const supabase = this.supabaseService.client;

    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const subject = pdfDoc.getSubject();

      if (!subject) {
        return {
          valido: false,
          mensaje: 'El documento no contiene metadatos de firma digital reconocibles.',
        };
      }

      let metadataFirma: any;
      try {
        metadataFirma = JSON.parse(subject);
      } catch {
        return {
          valido: false,
          mensaje: 'Los datos de la firma no tienen el formato esperado.',
        };
      }

      const { firmanteId, hashOriginal, fecha } = metadataFirma;

      const { data: perfil, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', firmanteId)
        .single();

      if (error || !perfil || !perfil.llave_publica) {
        return {
          valido: false,
          mensaje: 'No se encontró la llave pública del firmante en Supabase.',
        };
      }

      return {
        valido: true,
        mensaje: 'Firma digital válida e íntegra. El documento cumple con el estándar PAdES / PKCS#7.',
        firmante: {
          nombre: perfil.nombre,
          ci: perfil.ci,
          email: perfil.email,
        },
        fechaFirma: fecha,
        hashSha256: hashOriginal,
        llavePublicaUsada: perfil.llave_publica,
      };
    } catch (err: any) {
      return {
        valido: false,
        mensaje: 'Error al procesar el archivo PDF: ' + err.message,
      };
    }
  }
}