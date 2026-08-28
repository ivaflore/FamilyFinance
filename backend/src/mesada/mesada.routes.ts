import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { requireAdmin, requireGrupo } from '../middleware/grupo';
import { mesadaService } from './mesada.service';

export const mesadaRouter = Router();

// Mesada / cuenta personal
mesadaRouter.get('/groups/:grupoId/mesada', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    res.json(await mesadaService.resumenGrupo(req.grupoFamiliarId!));
  } catch (err) {
    next(err);
  }
});

mesadaRouter.get('/groups/:grupoId/mesada/:usuarioId/movimientos', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const esAdmin = req.rolEnGrupo === 'Administrador';
    res.json(await mesadaService.listarMovimientos(req.grupoFamiliarId!, req.usuarioId!, esAdmin, req.params.usuarioId));
  } catch (err) {
    next(err);
  }
});

mesadaRouter.post('/groups/:grupoId/mesada/:usuarioId/movimientos', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const data = z.object({ descripcion: z.string().min(1), monto: z.number() }).parse(req.body);
    const esAdmin = req.rolEnGrupo === 'Administrador';
    res
      .status(201)
      .json(await mesadaService.agregarMovimiento(req.grupoFamiliarId!, req.usuarioId!, esAdmin, req.params.usuarioId, data));
  } catch (err) {
    next(err);
  }
});

// Metas de ahorro
mesadaRouter.get('/groups/:grupoId/mesada/:usuarioId/metas', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const esAdmin = req.rolEnGrupo === 'Administrador';
    res.json(await mesadaService.listarMetasAhorro(req.grupoFamiliarId!, req.usuarioId!, esAdmin, req.params.usuarioId));
  } catch (err) {
    next(err);
  }
});

mesadaRouter.post('/groups/:grupoId/mesada/:usuarioId/metas', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const data = z.object({ nombre: z.string().min(1), montoObjetivo: z.number().positive() }).parse(req.body);
    const esAdmin = req.rolEnGrupo === 'Administrador';
    res
      .status(201)
      .json(await mesadaService.agregarMetaAhorro(req.grupoFamiliarId!, req.usuarioId!, esAdmin, req.params.usuarioId, data));
  } catch (err) {
    next(err);
  }
});

mesadaRouter.delete('/groups/:grupoId/mesada/:usuarioId/metas/:id', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const esAdmin = req.rolEnGrupo === 'Administrador';
    await mesadaService.eliminarMetaAhorro(req.grupoFamiliarId!, req.usuarioId!, esAdmin, req.params.usuarioId, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Tareas del hogar
mesadaRouter.get('/groups/:grupoId/tareas', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const tareas = await mesadaService.listarTareas(req.grupoFamiliarId!);
    res.json(
      tareas.map((t) => ({
        id: t.id,
        titulo: t.titulo,
        asignadoAUsuarioId: t.asignadoAUsuarioId,
        asignadoANombre: t.asignadoA?.nombre ?? null,
        recompensa: Number(t.recompensa),
        completada: t.completada,
      })),
    );
  } catch (err) {
    next(err);
  }
});

mesadaRouter.post('/groups/:grupoId/tareas', requireAuth, requireGrupo, requireAdmin, async (req, res, next) => {
  try {
    const data = z
      .object({ titulo: z.string().min(1), asignadoAUsuarioId: z.string().optional(), recompensa: z.number().nonnegative().optional() })
      .parse(req.body);
    res.status(201).json(await mesadaService.agregarTarea(req.grupoFamiliarId!, data));
  } catch (err) {
    next(err);
  }
});

mesadaRouter.patch('/groups/:grupoId/tareas/:id', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const { completada } = z.object({ completada: z.boolean() }).parse(req.body);
    await mesadaService.marcarCompletada(req.grupoFamiliarId!, req.params.id, completada);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

mesadaRouter.delete('/groups/:grupoId/tareas/:id', requireAuth, requireGrupo, requireAdmin, async (req, res, next) => {
  try {
    await mesadaService.eliminarTarea(req.grupoFamiliarId!, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
