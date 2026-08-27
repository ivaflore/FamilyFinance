import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { requireAdmin, requireGrupo } from '../middleware/grupo';
import { gruposService } from './grupos.service';

export const gruposRouter = Router();

gruposRouter.post('/groups', requireAuth, async (req, res, next) => {
  try {
    const { nombre } = z.object({ nombre: z.string().min(1) }).parse(req.body);
    const grupo = await gruposService.crearGrupo(nombre, req.usuarioId!);
    res.status(201).json(grupo);
  } catch (err) {
    next(err);
  }
});

gruposRouter.get('/groups/:grupoId/members', requireAuth, requireGrupo, async (req, res, next) => {
  try {
    const miembros = await gruposService.listarMiembros(req.grupoFamiliarId!);
    res.json(
      miembros.map((m) => ({
        usuarioId: m.usuarioId,
        nombre: m.usuario.nombre,
        fotoUrl: m.usuario.fotoUrl,
        rol: m.rol,
      })),
    );
  } catch (err) {
    next(err);
  }
});

gruposRouter.post('/groups/:grupoId/invite', requireAuth, requireGrupo, requireAdmin, async (req, res, next) => {
  try {
    const { correo } = z.object({ correo: z.string().email().optional() }).parse(req.body ?? {});
    const invitacion = await gruposService.generarInvitacion(req.grupoFamiliarId!, req.usuarioId!, correo);
    res.status(201).json(invitacion);
  } catch (err) {
    next(err);
  }
});

gruposRouter.delete(
  '/groups/:grupoId/members/:miembroId',
  requireAuth,
  requireGrupo,
  requireAdmin,
  async (req, res, next) => {
    try {
      await gruposService.removerMiembro(req.grupoFamiliarId!, req.params.miembroId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
);

gruposRouter.post('/invitations/:token/accept', requireAuth, async (req, res, next) => {
  try {
    const resultado = await gruposService.aceptarInvitacion(req.params.token, req.usuarioId!);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

gruposRouter.get('/my-groups', requireAuth, async (req, res, next) => {
  try {
    res.json(await gruposService.listarGruposDeUsuario(req.usuarioId!));
  } catch (err) {
    next(err);
  }
});
