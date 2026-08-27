import crypto from 'node:crypto';

// BR-02 (Unidad 1: Identidad y Autenticación): sesión válida por 24h, renovable con actividad.
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export function generarTokenSesion(): { token: string; hash: string } {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, hash: hashToken(token) };
}

// Nunca se guarda el token en claro (BR-05/SECURITY-12) — solo su hash.
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function nuevaExpiracion(): Date {
  return new Date(Date.now() + SESSION_DURATION_MS);
}
