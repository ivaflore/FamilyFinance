import { NextFunction, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { AppError } from './errorHandler';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      grupoFamiliarId?: string;
      rolEnGrupo?: 'Administrador' | 'Miembro';
    }
  }
}

// SECURITY-08 (bloqueante): el grupoFamiliarId SIEMPRE se resuelve aquí a
// partir de la membresía real del usuario autenticado en la base de datos —
// nunca se confía en un grupoFamiliarId provisto directamente por el cliente
// más allá de usarlo como referencia a verificar. Ver component-dependency.md.
export async function requireGrupo(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const grupoId = req.params.grupoId;
  if (!req.usuarioId || !grupoId) return next(new AppError(400, 'Solicitud inválida.'));

  const membresia = await prisma.membresia.findUnique({
    where: { grupoFamiliarId_usuarioId: { grupoFamiliarId: grupoId, usuarioId: req.usuarioId } },
  });

  if (!membresia) return next(new AppError(403, 'No perteneces a este grupo familiar.'));

  req.grupoFamiliarId = grupoId;
  req.rolEnGrupo = membresia.rol;
  next();
}

// BR-09/SECURITY-08: autorización a nivel de función — solo Administrador.
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.rolEnGrupo !== 'Administrador') {
    return next(new AppError(403, 'Solo el administrador del grupo puede hacer esto.'));
  }
  next();
}
