import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { hashToken, SESSION_DURATION_MS } from '../lib/session';
import { requireAuth } from '../middleware/auth';
import { identidadService } from './identidad.service';

export const identidadRouter = Router();

const googleLoginSchema = z.object({ idToken: z.string().min(10) });

identidadRouter.post('/auth/google', async (req, res, next) => {
  try {
    const { idToken } = googleLoginSchema.parse(req.body);
    const { usuario, token } = await identidadService.iniciarSesionConGoogle(idToken);

    res.cookie('ff_session', token, {
      httpOnly: true,
      secure: process.env.SESSION_COOKIE_SECURE !== 'false',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS,
    });

    res.json({ usuario: serializarUsuario(usuario) });
  } catch (err) {
    next(err);
  }
});

identidadRouter.post('/auth/logout', requireAuth, async (req, res, next) => {
  try {
    const token = req.cookies?.ff_session as string;
    await identidadService.cerrarSesion(hashToken(token));
    res.clearCookie('ff_session');
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

identidadRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const usuario = await identidadService.obtenerPerfil(req.usuarioId!);
    const membresias = await prisma.membresia.findMany({
      where: { usuarioId: req.usuarioId! },
      include: { grupo: true },
    });
    res.json({
      usuario: serializarUsuario(usuario),
      grupos: membresias.map((m) => ({ id: m.grupo.id, nombre: m.grupo.nombre, rol: m.rol })),
    });
  } catch (err) {
    next(err);
  }
});

function serializarUsuario(u: { id: string; nombre: string; correo: string; fotoUrl: string | null }) {
  return { id: u.id, nombre: u.nombre, correo: u.correo, fotoUrl: u.fotoUrl };
}
