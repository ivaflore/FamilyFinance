import { NextFunction, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { hashToken, nuevaExpiracion } from '../lib/session';
import { AppError } from './errorHandler';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuarioId?: string;
    }
  }
}

// BR-02/BR-05/SECURITY-12 (Unidad 1): valida la sesión en cada request,
// renueva silenciosamente la expiración mientras haya actividad, y rechaza
// (fail closed) cualquier token ausente, expirado o invalidado.
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.ff_session as string | undefined;
  if (!token) return next(new AppError(401, 'No has iniciado sesión.'));

  const hash = hashToken(token);
  const sesion = await prisma.sesion.findUnique({ where: { token: hash } });

  if (!sesion || sesion.estado !== 'Activa' || sesion.fechaExpiracion < new Date()) {
    return next(new AppError(401, 'Tu sesión expiró, vuelve a iniciar sesión.'));
  }

  await prisma.sesion.update({
    where: { token: hash },
    data: { fechaUltimaActividad: new Date(), fechaExpiracion: nuevaExpiracion() },
  });

  req.usuarioId = sesion.usuarioId;
  next();
}
