type Nivel = 'info' | 'warn' | 'error';

// SECURITY-03: logging estructurado; nunca se registran tokens, ID tokens de
// Google, ni montos/datos financieros en texto — solo identificadores.
export function log(nivel: Nivel, mensaje: string, meta: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), nivel, mensaje, ...meta }));
}
