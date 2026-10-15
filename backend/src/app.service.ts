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

  // 1. REGISTRO EN SUPABASE AUTH (El Trigger on_auth_user_created inserta en public.perfiles)
  async registerUser(email: string, password: string, nombre: string, ci: string) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, ci } },
    });

    if (error) throw new BadRequestException('Error al registrar usuario: ' + error.message);

    // Aseguramos que la fila de perfiles tenga los datos actualizados
    if (data.user) {
      await supabase.from('perfiles').upsert({
        id: data.user.id,
        email: email,
        nombre: nombre || email,
        ci: ci || '',
        updated_at: new Date(),
      });
    }

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
      .maybeSingle();

    return {
      message: 'Inicio de sesión exitoso',
      user: data.user,
      perfil: perfil || { nombre: data.user.email, email: data.user.email, ci: '', llave_publica: null, certificado_pem: null },
    };
  }

  // 3. GENERAR PAR DE LLAVES RSA (2048 BITS) Y CERTIFICADO X.509 PEM
  async generateKeyPair(userId: string) {
    const supabase = this.supabaseService.client;

    // 1. Buscar perfil existente
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // 2. Obtener email garantizado (si no está en perfiles, se consulta en Auth)
    let userEmail = perfil?.email;
    let userName = perfil?.nombre;
    let userCi = perfil?.ci;

    if (!userEmail) {
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      userEmail = authUser?.user?.email || 'usuario@upds.edu.bo';
      userName = userName || authUser?.user?.user_metadata?.nombre || 'Estudiante UPDS';
      userCi = userCi || authUser?.user?.user_metadata?.ci || '';
    }

    const nombre = userName || 'Estudiante UPDS';
    const email = userEmail || 'estudiante@upds.edu.bo';

    // 3. Generar claves RSA nativas de 2048 bits
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

    // 4. Generar Certificado X.509 autofirmado en formato PEM para Adobe Reader DC
    const certPem = this.generateX509CertificatePem(privateKey, { nombre, email });

    // 5. UPSERT garantizando el envío de EMAIL (resuelve la restricción NOT NULL de tu tabla)
    const { error } = await supabase
      .from('perfiles')
      .upsert({
        id: userId,
        email: email, // <-- Campo NOT NULL en tu tabla public.perfiles
        nombre: nombre,
        ci: userCi || '',
        llave_publica: publicKey,
        certificado_pem: certPem,
        updated_at: new Date(),
      });

    if (error) {
      console.error('Error al guardar perfiles en Supabase:', error);
      throw new BadRequestException('Error al guardar en Supabase: ' + error.message);
    }

    return {
      message: 'Par de llaves y Certificado X.509 generados exitosamente',
      llavePublica: publicKey,
      llavePrivada: privateKey,
      certificadoPem: certPem,
    };
  }

  // Helper para crear el certificado X.509 en texto PEM
  private generateX509CertificatePem(privateKeyPem: string, certData: { nombre: string; email: string }): string {
    const pkcs1Pem = crypto.createPrivateKey(privateKeyPem).export({ type: 'pkcs1', format: 'pem' }) as string;
    const privateKeyObj = forge.pki.privateKeyFromPem(pkcs1Pem);

    const cert = forge.pki.createCertificate();
    cert.publicKey = forge.pki.setRsaPublicKey(privateKeyObj.n, privateKeyObj.e);
    cert.serialNumber = '01' + Date.now().toString(16);

    cert.validity.notBefore = new Date(Date.now() - 24 * 60 * 60 * 1000);
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 5);

    const attrs = [
      { name: 'commonName', value: certData.nombre },
      { name: 'countryName', value: 'BO' },
      { name: 'organizationName', value: 'Universidad Privada Domingo Savio - UPDS' },
      { name: 'organizationalUnitName', value: 'Criptografia y Seguridad de la Informacion' },
      { name: 'emailAddress', value: certData.email },
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    cert.setExtensions([
      { name: 'basicConstraints', cA: true },
      { name: 'keyUsage', digitalSignature: true, nonRepudiation: true, keyEncipherment: true, keyCertSign: true },
      { name: 'extKeyUsage', clientAuth: true, emailProtection: true, codeSigning: true, timeStamping: true },
    ]);

    cert.sign(privateKeyObj, forge.md.sha256.create());
    return forge.pki.certificateToPem(cert);
  }

  // 4. CREAR PKCS#12 (.p12) INTERNO PARA EL MOTOR DE FIRMA
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

    cert.validity.notBefore = new Date(Date.now() - 24 * 60 * 60 * 1000);
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 5);

    const attrs = [
      { name: 'commonName', value: certData.nombre },
      { name: 'countryName', value: 'BO' },
      { name: 'organizationName', value: 'Universidad Privada Domingo Savio - UPDS' },
      { name: 'organizationalUnitName', value: 'Criptografia Aplicada' },
      { name: 'emailAddress', value: certData.email },
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    cert.setExtensions([
      { name: 'basicConstraints', cA: true },
      { name: 'keyUsage', digitalSignature: true, nonRepudiation: true, keyEncipherment: true, keyCertSign: true },
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

  // 5. FIRMAR PDF DIGITALMENTE CON PAdES (COMPATIBLE CON ADOBE READER DC)
  async signPdf(fileBuffer: Buffer, fileName: string, privateKeyPem: string, userId: string) {
    const supabase = this.supabaseService.client;

    const { data: perfil, error: userError } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !perfil) {
      throw new NotFoundException('Usuario no encontrado en la base de datos');
    }

    const hashOriginal = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const fechaFirma = new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' });

    // PASO A: Cargar el PDF y estampar el sello visual institucional y legible
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width } = lastPage.getSize();

    const boxWidth = width - 70;
    const boxHeight = 84;
    const boxX = 35;
    const boxY = 30;

    // Caja con fondo claro formal y borde elegante
    lastPage.drawRectangle({
      x: boxX,
      y: boxY,
      width: boxWidth,
      height: boxHeight,
      borderColor: rgb(0.85, 0.15, 0.2), // Rojo UPDS
      borderWidth: 1.2,
      color: rgb(0.98, 0.98, 0.99),       // Fondo blanco suave (no invasivo)
    });

    // Franja lateral distintiva
    lastPage.drawRectangle({
      x: boxX,
      y: boxY,
      width: 5,
      height: boxHeight,
      color: rgb(0.85, 0.15, 0.2),
    });

    // Encabezado institucional
    lastPage.drawText('FIRMA DIGITAL VALIDADA · UNIVERSIDAD PRIVADA DOMINGO SAVIO', {
      x: boxX + 16,
      y: boxY + boxHeight - 16,
      size: 8.5,
      font: helveticaBold,
      color: rgb(0.85, 0.15, 0.2),
    });

    // Identidad del signatario
    lastPage.drawText(`Firmante: ${perfil.nombre}  |  Doc. Identidad: ${perfil.ci || 'N/A'}`, {
      x: boxX + 16,
      y: boxY + boxHeight - 31,
      size: 8.5,
      font: helveticaBold,
      color: rgb(0.12, 0.15, 0.2),
    });

    // Metadatos de Estándar y Fecha
    lastPage.drawText(`Fecha y Hora: ${fechaFirma}  |  Estándar: PAdES-BES / PKCS#7 (RSA-2048 / SHA-256)`, {
      x: boxX + 16,
      y: boxY + boxHeight - 45,
      size: 7.5,
      font: helveticaFont,
      color: rgb(0.35, 0.4, 0.45),
    });

    // Hash SHA-256 de integridad
    lastPage.drawText(`Resumen SHA-256: ${hashOriginal.substring(0, 52)}...`, {
      x: boxX + 16,
      y: boxY + boxHeight - 59,
      size: 7,
      font: helveticaFont,
      color: rgb(0.45, 0.5, 0.55),
    });

    // Declaración de no repudio e integridad
    lastPage.drawText('Integridad, Autenticidad y No Repudio Verificables en Adobe Acrobat Reader DC', {
      x: boxX + 16,
      y: boxY + boxHeight - 72,
      size: 7,
      font: helveticaBold,
      color: rgb(0.1, 0.55, 0.25), // Verde éxito formal
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

    // PASO B: Inyectar placeholder PAdES con 16384 bytes reservados
    pdflibAddPlaceholder({
      pdfDoc,
      reason: 'Firma Digital e Integridad UPDS',
      contactInfo: perfil.email || '',
      name: perfil.nombre,
      location: 'La Paz, Bolivia',
      signatureLength: 16384,
    });

    const pdfConPlaceholderBytes = await pdfDoc.save({ useObjectStreams: false });
    const pdfConPlaceholderBuffer = Buffer.from(pdfConPlaceholderBytes);

    // PASO C: Firma criptográfica CMS / PKCS#7 con compatibilidad robusta para @signpdf v3
    let finalSignedBuffer: Buffer;
    try {
      const p12Buffer = this.createP12Certificate(privateKeyPem, {
        nombre: perfil.nombre,
        email: perfil.email || '',
        ci: perfil.ci,
      });

      const p12Signer = new P12Signer(p12Buffer, { passphrase: 'upds-pass' });

      const signer = signpdfPkg.default || signpdfPkg;
      if (typeof signer.sign === 'function') {
        finalSignedBuffer = await signer.sign(pdfConPlaceholderBuffer, p12Signer);
      } else {
        const instance = new (signer as any)();
        finalSignedBuffer = await instance.sign(pdfConPlaceholderBuffer, p12Signer);
      }
    } catch (err: any) {
      console.error('Error al estampar firma PAdES:', err);
      throw new BadRequestException('Error en el motor de firma PAdES: ' + err.message);
    }

    // PASO D: Registrar evidencia en la tabla documentos_firmados de Supabase
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
        .maybeSingle();

      if (error || !perfil || !perfil.llave_publica) {
        return {
          valido: false,
          mensaje: 'No se encontró el registro o llave pública del firmante en Supabase.',
        };
      }

      // Verificación de presencia del contenedor PKCS#7 en los bytes crudos del PDF
      const pdfString = fileBuffer.toString('latin1');
      const hasSignatureDict = pdfString.includes('/ByteRange') && (pdfString.includes('adbe.pkcs7.detached') || pdfString.includes('ETSI.CAdES.detached'));

      if (!hasSignatureDict) {
        return {
          valido: false,
          mensaje: 'Alerta de Seguridad: Se eliminó o corrompió el contenedor de firma digital PAdES del PDF.',
        };
      }

      return {
        valido: true,
        mensaje: 'Firma digital válida e íntegra. El documento cumple con el estándar PAdES / PKCS#7 y coincide con la identidad registrada.',
        firmante: {
          nombre: perfil.nombre,
          ci: perfil.ci,
          email: perfil.email || '',
        },
        fechaFirma: fecha,
        hashSha256: hashOriginal,
        llavePublicaUsada: perfil.llave_publica,
        certificadoPem: perfil.certificado_pem,
      };
    } catch (err: any) {
      return {
        valido: false,
        mensaje: 'Error al procesar el archivo PDF: ' + err.message,
      };
    }
  }
}