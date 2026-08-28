import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { requireAdmin, requireGrupo } from '../middleware/grupo';
import { financieroService } from './financiero.service';

export const financieroRouter = Router();

const gastoSchema = z.object({
  descripcion: z.string().min(1).max(200),
  monto: z.number().positive(),
  categoria: z.string().min(1),
});

const MIME_IMAGENES = /^image\/(jpeg|png|webp|heic|heif)$/;
const uploadBoleta = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!MIME_IMAGENES.test(file.mimetype)) return cb(new AppError(400, 'El archivo debe ser una imagen (JPG, PNG o WEBP).'));
    cb(null, true);
  },
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

financieroRouter.post(
  '/groups/:grupoId/gastos/desde-boleta',
  requireAuth,
  requireGrupo,
  (req, res, next) => uploadBoleta.single('imagen')(req, res, (err) => next(err instanceof multer.MulterError ? new AppError(400, 'La imagen es demasiado grande (máximo 5MB).') : err)),
  async (req, res, next) => {
    try {
      if (!req.file) throw new AppError(400, 'Debes adjuntar una imagen de la boleta.');
      const extraido = await financieroService.interpretarBoleta(req.file.buffer.toString('base64'), req.file.mimetype);
      res.json(extraido);
    } catch (err) {
      next(err);
    }
  },
);

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

financieroRouter.put('/groups/:grupoId/gastos/:id', requireAuth, requireGrupo, requireAdmin, async (req, res, next) => {
  try {
    const data = gastoSchema.parse(req.body);
    await financieroService.actualizarGasto(req.grupoFamiliarId!, req.params.id, data);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

financieroRouter.delete('/groups/:grupoId/gastos/:id', requireAuth, requireGrupo, requireAdmin, async (req, res, next) => {
  try {
    await financieroService.eliminarGasto(req.grupoFamiliarId!, req.params.id);
    res.status(204).end();
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

// Gastos recurrentes (pagos fijos del grupo)
const gastoRecurrenteSchema = z.object({
  descripcion: z.string().min(1).max(200),
  monto: z.number().positive(),
  categoria: z.string().min(1),
  diaDelMes: z.number().int().min(1).max(28),
});

financieroRouter.get('/groups/:grupoId/gastos-recurrentes', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const recurrentes = await financieroService.listarGastosRecurrentes(req.grupoFamiliarId!);
    res.json(recurrentes.map((r) => ({ ...r, monto: Number(r.monto) })));
  } catch (err) {
    next(err);
  }
});

financieroRouter.post('/groups/:grupoId/gastos-recurrentes', requireAuth, requireGrupo, requireAdmin, async (req, res, next) => {
  try {
    const data = gastoRecurrenteSchema.parse(req.body);
    res.status(201).json(await financieroService.agregarGastoRecurrente(req.grupoFamiliarId!, data));
  } catch (err) {
    next(err);
  }
});

financieroRouter.patch(
  '/groups/:grupoId/gastos-recurrentes/:id',
  requireAuth,
  requireGrupo,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { activo } = z.object({ activo: z.boolean() }).parse(req.body);
      await financieroService.activarGastoRecurrente(req.grupoFamiliarId!, req.params.id, activo);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
);

financieroRouter.delete(
  '/groups/:grupoId/gastos-recurrentes/:id',
  requireAuth,
  requireGrupo,
  requireAdmin,
  async (req, res, next) => {
    try {
      await financieroService.eliminarGastoRecurrente(req.grupoFamiliarId!, req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
);

financieroRouter.post(
  '/groups/:grupoId/gastos-recurrentes/generar',
  requireAuth,
  requireGrupo,
  async (req, res, next) => {
    try {
      res.json(await financieroService.generarGastosRecurrentesDelMes(req.grupoFamiliarId!, req.usuarioId!));
    } catch (err) {
      next(err);
    }
  },
);

// Ingresos
const ingresoSchema = z.object({
  descripcion: z.string().min(1).max(200),
  monto: z.number().positive(),
});

financieroRouter.get('/groups/:grupoId/ingresos', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const ingresos = await financieroService.listarIngresos(req.grupoFamiliarId!);
    res.json(
      ingresos.map((i) => ({
        id: i.id,
        descripcion: i.descripcion,
        monto: Number(i.monto),
        fecha: i.fecha,
        miembro: i.usuario.nombre,
      })),
    );
  } catch (err) {
    next(err);
  }
});

financieroRouter.post('/groups/:grupoId/ingresos', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const data = ingresoSchema.parse(req.body);
    res.status(201).json(await financieroService.registrarIngreso(req.grupoFamiliarId!, req.usuarioId!, data));
  } catch (err) {
    next(err);
  }
});

financieroRouter.put('/groups/:grupoId/ingresos/:id', requireAuth, requireGrupo, requireAdmin, async (req, res, next) => {
  try {
    const data = ingresoSchema.parse(req.body);
    await financieroService.actualizarIngreso(req.grupoFamiliarId!, req.params.id, data);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

financieroRouter.delete('/groups/:grupoId/ingresos/:id', requireAuth, requireGrupo, requireAdmin, async (req, res, next) => {
  try {
    await financieroService.eliminarIngreso(req.grupoFamiliarId!, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
