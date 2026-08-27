import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { requireAdmin, requireGrupo } from '../middleware/grupo';
import { financieroService } from './financiero.service';

export const financieroRouter = Router();

const gastoSchema = z.object({
  descripcion: z.string().min(1).max(200),
  monto: z.number().positive(),
  categoria: z.string().min(1),
});

financieroRouter.post('/groups/:grupoId/gastos', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const data = gastoSchema.parse(req.body);
    const gasto = await financieroService.registrarGasto(req.grupoFamiliarId!, req.usuarioId!, data);
    res.status(201).json(gasto);
  } catch (err) {
    next(err);
  }
});

financieroRouter.get('/groups/:grupoId/gastos', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const gastos = await financieroService.listarGastos(req.grupoFamiliarId!);
    res.json(
      gastos.map((g) => ({
        id: g.id,
        descripcion: g.descripcion,
        monto: Number(g.monto),
        categoria: g.categoria,
        fecha: g.fecha,
        miembro: g.usuario.nombre,
      })),
    );
  } catch (err) {
    next(err);
  }
});

financieroRouter.put('/groups/:grupoId/presupuesto', requireAuth, requireGrupo, requireAdmin, async (req, res, next) => {
  try {
    const { categoria, monto } = z.object({ categoria: z.string().min(1), monto: z.number().nonnegative() }).parse(req.body);
    res.json(await financieroService.definirPresupuesto(req.grupoFamiliarId!, categoria, monto));
  } catch (err) {
    next(err);
  }
});

financieroRouter.get('/groups/:grupoId/presupuesto', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    res.json(await financieroService.estadoPresupuesto(req.grupoFamiliarId!));
  } catch (err) {
    next(err);
  }
});

financieroRouter.get('/groups/:grupoId/miembros/aportes', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    res.json(await financieroService.aportePorMiembro(req.grupoFamiliarId!));
  } catch (err) {
    next(err);
  }
});
