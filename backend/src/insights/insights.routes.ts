import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { requireGrupo } from '../middleware/grupo';
import { insightsService } from './insights.service';

export const insightsRouter = Router();

insightsRouter.get('/groups/:grupoId/segmentacion', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    res.json(await insightsService.listarSegmentacion(req.grupoFamiliarId!));
  } catch (err) {
    next(err);
  }
});

insightsRouter.patch('/groups/:grupoId/segmentacion/:id', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const { segmento } = z.object({ segmento: z.enum(['cat1', 'cat2', 'saving']) }).parse(req.body);
    await insightsService.clasificarProducto(req.grupoFamiliarId!, req.params.id, segmento);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

insightsRouter.post('/groups/:grupoId/asistente', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const { pregunta } = z.object({ pregunta: z.string().min(1) }).parse(req.body);
    res.json({ respuesta: await insightsService.consultarAsistente(req.grupoFamiliarId!, pregunta) });
  } catch (err) {
    next(err);
  }
});
