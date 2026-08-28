import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { notificacionesService } from './notificaciones.service';

export const notificacionesRouter = Router();

notificacionesRouter.get('/push/estado', requireAuth, (_req, res) => {
  res.json(notificacionesService.estado());
});

notificacionesRouter.post('/push/suscribir', requireAuth, async (req, res, next) => {
  try {
    const data = z.object({ endpoint: z.string().min(1), p256dh: z.string().min(1), auth: z.string().min(1) }).parse(req.body);
    await notificacionesService.suscribir(req.usuarioId!, data);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

notificacionesRouter.post('/push/desuscribir', requireAuth, async (req, res, next) => {
  try {
    const { endpoint } = z.object({ endpoint: z.string().min(1) }).parse(req.body);
    await notificacionesService.desuscribir(endpoint);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
