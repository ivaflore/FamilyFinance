import crypto from 'node:crypto';
import { prisma } from '../db/prisma';
import { hashToken } from '../lib/session';
import { AppError } from '../middleware/errorHandler';
import { notificacionesService } from '../notificaciones/notificaciones.service';
import { gruposRepository } from './grupos.repository';
import { invitacionEsAceptable, puedeRemoverAdministrador } from './grupos.logic';

const INVITACION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // BR-10: 7 días

export const gruposService = {
  crearGrupo(nombre: string, usuarioId: string) {
    if (!nombre?.trim()) throw new AppError(400, 'El grupo necesita un nombre.');
    return gruposRepository.crearGrupo(nombre.trim(), usuarioId);
  },

  async generarInvitacion(grupoFamiliarId: string, creadorId: string, correoInvitado?: string) {
    const tokenPlano = crypto.randomBytes(24).toString('hex');
    const hash = hashToken(tokenPlano);
    const expiracion = new Date(Date.now() + INVITACION_DURATION_MS);
    await gruposRepository.crearInvitacion(grupoFamiliarId, creadorId, hash, expiracion, correoInvitado);
    return { tokenInvitacion: tokenPlano, expiracion };
  },

  async aceptarInvitacion(tokenInvitacion: string, usuarioId: string) {
    const hash = hashToken(tokenInvitacion);
    const invitacion = await gruposRepository.buscarInvitacionPorHash(hash);
    if (!invitacion) throw new AppError(404, 'Invitación no encontrada.');
    if (!invitacionEsAceptable(invitacion, new Date())) {
      throw new AppError(410, 'Esta invitación ya no es válida. Pide una nueva al administrador del grupo.');
    }

    // BR-11: idempotente — si ya es miembro, no duplica la membresía
    const existente = await gruposRepository.buscarMembresia(invitacion.grupoFamiliarId, usuarioId);
    if (!existente) {
      const miembrosActuales = await gruposRepository.listarMiembros(invitacion.grupoFamiliarId);
      await gruposRepository.crearMembresia(invitacion.grupoFamiliarId, usuarioId, 'Miembro');
      const nuevoUsuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
      notificacionesService.notificarUsuarios(
        miembrosActuales.map((m) => m.usuarioId),
        { title: 'Nuevo miembro en la familia', body: `${nuevoUsuario?.nombre ?? 'Alguien'} se unió al grupo.`, url: '/#familia' },
      );
    }
    if (invitacion.estado === 'Pendiente') {
      await gruposRepository.marcarInvitacionAceptada(invitacion.id);
    }
    return { grupoFamiliarId: invitacion.grupoFamiliarId };
  },

  async removerMiembro(grupoFamiliarId: string, miembroId: string) {
    const membresia = await gruposRepository.buscarMembresia(grupoFamiliarId, miembroId);
    if (!membresia) throw new AppError(404, 'Ese miembro no pertenece al grupo.');

    if (membresia.rol === 'Administrador') {
      const totalAdmins = await gruposRepository.contarAdministradores(grupoFamiliarId);
      if (!puedeRemoverAdministrador(totalAdmins)) {
        throw new AppError(400, 'No puedes remover al único administrador del grupo.');
      }
    }
    await gruposRepository.removerMembresia(grupoFamiliarId, miembroId);
  },

  listarMiembros(grupoFamiliarId: string) {
    return gruposRepository.listarMiembros(grupoFamiliarId);
  },

  async listarGruposDeUsuario(usuarioId: string) {
    const membresias = await gruposRepository.listarGruposDeUsuario(usuarioId);
    return membresias.map((m) => ({ id: m.grupo.id, nombre: m.grupo.nombre, rol: m.rol }));
  },
};
