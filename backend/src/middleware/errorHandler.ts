import { NextFunction, Request, Response } from 'express';
import { log } from '../lib/logger';

// SECURITY-09/SECURITY-15: errores genéricos hacia el cliente, sin exponer
// detalles internos; fail-closed por defecto (500 genérico ante cualquier
// excepción no controlada).
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  log('error', 'Error no controlado', {
    path: req.path,
    error: err instanceof Error ? err.message : String(err),
  });
  res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
}
