// Normalización inteligente: garantiza que siempre haya un solo "/api" al final
const rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').trim().replace(/\/+$/, '');
const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

// 1. Registro de Usuario (con datos reales para Supabase)
export async function registerApi(email: string, password: string, nombre: string, ci: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nombre, ci }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error en el registro');
  }
  return res.json();
}

// 2. Inicio de Sesión
export async function loginApi(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Credenciales incorrectas');
  }
  return res.json();
}

// 3. Generación del Par de Llaves RSA (2048-bit)
export async function generateKeysApi(userId: string) {
  const res = await fetch(`${API_URL}/keys/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al generar las llaves');
  }
  return res.json();
}

// 4. Firmar Documento PDF con Llave Privada
export async function signPdfApi(file: File, privateKey: string, userId: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('privateKey', privateKey);
  formData.append('userId', userId);

  const res = await fetch(`${API_URL}/pdf/sign`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al firmar el PDF');
  }
  return res.json();
}

// 5. Verificar Firma Digital de un PDF
export async function verifyPdfApi(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/pdf/verify`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al verificar el PDF');
  }
  return res.json();
}