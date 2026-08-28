import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { requireGrupo } from '../middleware/grupo';
import { hogarService } from './hogar.service';

export const hogarRouter = Router();

// Alacena
hogarRouter.get('/groups/:grupoId/alacena', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    res.json(await hogarService.listarAlacena(req.grupoFamiliarId!));
  } catch (err) {
    next(err);
  }
});
hogarRouter.post('/groups/:grupoId/alacena', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const data = z
      .object({
        nombre: z.string().min(1),
        unidad: z.string().min(1).optional(),
        cantidadIdeal: z.number().positive(),
        cantidadActual: z.number().nonnegative(),
        icono: z.string().optional(),
      })
      .parse(req.body);
    res.status(201).json(await hogarService.agregarProductoAlacena(req.grupoFamiliarId!, data));
  } catch (err) {
    next(err);
  }
});
hogarRouter.patch('/groups/:grupoId/alacena/:productoId', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const { cantidadActual } = z.object({ cantidadActual: z.number().nonnegative() }).parse(req.body);
    await hogarService.actualizarCantidadActual(req.grupoFamiliarId!, req.params.productoId, cantidadActual);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Lista de compras
hogarRouter.get('/groups/:grupoId/compras', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    res.json(await hogarService.listarCompras(req.grupoFamiliarId!));
  } catch (err) {
    next(err);
  }
});
hogarRouter.post('/groups/:grupoId/compras', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const data = z.object({ nombre: z.string().min(1), precioEstimado: z.number().nonnegative().optional() }).parse(req.body);
    res.status(201).json(await hogarService.agregarItemCompra(req.grupoFamiliarId!, data));
  } catch (err) {
    next(err);
  }
});
hogarRouter.patch('/groups/:grupoId/compras/:itemId', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const { comprado } = z.object({ comprado: z.boolean() }).parse(req.body);
    await hogarService.marcarComprado(req.grupoFamiliarId!, req.params.itemId, comprado);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
hogarRouter.post('/groups/:grupoId/compras/generar-desde-menu', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const { anio, mes } = z.object({ anio: z.number(), mes: z.number() }).parse(req.body);
    res.json(await hogarService.generarListaDesdeMenu(req.grupoFamiliarId!, anio, mes));
  } catch (err) {
    next(err);
  }
});

// Recetario
hogarRouter.get('/recetas-plantilla', requireAuth, async (_req, res, next) => {
  try {
    res.json(await hogarService.listarRecetasPlantilla());
  } catch (err) {
    next(err);
  }
});
hogarRouter.post('/groups/:grupoId/recetas/importar/:plantillaId', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    res.status(201).json(await hogarService.importarRecetaPlantilla(req.grupoFamiliarId!, req.params.plantillaId));
  } catch (err) {
    next(err);
  }
});
hogarRouter.get('/groups/:grupoId/recetas', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    res.json(await hogarService.listarRecetas(req.grupoFamiliarId!));
  } catch (err) {
    next(err);
  }
});
hogarRouter.post('/groups/:grupoId/recetas', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const data = z
      .object({
        nombre: z.string().min(1),
        tipos: z.array(z.string()).min(1),
        tiempoMin: z.number().positive(),
        porciones: z.number().positive(),
        ingredientes: z.array(z.object({ n: z.string(), cat: z.string() })),
        pasos: z.array(z.string()),
      })
      .parse(req.body);
    res.status(201).json(await hogarService.agregarReceta(req.grupoFamiliarId!, data));
  } catch (err) {
    next(err);
  }
});

// Calendario
hogarRouter.get('/groups/:grupoId/calendario', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const anio = Number(req.query.anio);
    const mes = Number(req.query.mes);
    res.json(await hogarService.obtenerCalendarioMes(req.grupoFamiliarId!, anio, mes));
  } catch (err) {
    next(err);
  }
});
hogarRouter.post('/groups/:grupoId/calendario', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const data = z.object({ fecha: z.string(), tipoComida: z.string(), recetaId: z.string() }).parse(req.body);
    res.status(201).json(await hogarService.planificarComida(req.grupoFamiliarId!, data));
  } catch (err) {
    next(err);
  }
});
