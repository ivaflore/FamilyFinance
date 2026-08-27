import { prisma } from '../db/prisma';

export const gruposRepository = {
  crearGrupo(nombre: string, adminUsuarioId: string) {
    // BR-08: transacción — el grupo y su primer Administrador se crean juntos
    return prisma.$transaction(async (tx) => {
      const grupo = await tx.grupoFamiliar.create({ data: { nombre } });
      await tx.membresia.create({
        data: { grupoFamiliarId: grupo.id, usuarioId: adminUsuarioId, rol: 'Administrador' },
      });
      return grupo;
    });
  },
  crearInvitacion(
    grupoFamiliarId: string,
    creadaPorUsuarioId: string,
    tokenHash: string,
    expiracion: Date,
    correoInvitado?: string,
  ) {
    return prisma.invitacion.create({
      data: { grupoFamiliarId, creadaPorUsuarioId, tokenInvitacionHash: tokenHash, fechaExpiracion: expiracion, correoInvitado },
    });
  },
  buscarInvitacionPorHash(hash: string) {
    return prisma.invitacion.findUnique({ where: { tokenInvitacionHash: hash } });
  },
  marcarInvitacionAceptada(id: string) {
    return prisma.invitacion.update({ where: { id }, data: { estado: 'Aceptada' } });
  },
  buscarMembresia(grupoFamiliarId: string, usuarioId: string) {
    return prisma.membresia.findUnique({
      where: { grupoFamiliarId_usuarioId: { grupoFamiliarId, usuarioId } },
    });
  },
  crearMembresia(grupoFamiliarId: string, usuarioId: string, rol: 'Administrador' | 'Miembro' = 'Miembro') {
    return prisma.membresia.create({ data: { grupoFamiliarId, usuarioId, rol } });
  },
  listarMiembros(grupoFamiliarId: string) {
    return prisma.membresia.findMany({ where: { grupoFamiliarId }, include: { usuario: true } });
  },
  contarAdministradores(grupoFamiliarId: string) {
    return prisma.membresia.count({ where: { grupoFamiliarId, rol: 'Administrador' } });
  },
  removerMembresia(grupoFamiliarId: string, usuarioId: string) {
    return prisma.membresia.delete({ where: { grupoFamiliarId_usuarioId: { grupoFamiliarId, usuarioId } } });
  },
  listarGruposDeUsuario(usuarioId: string) {
    return prisma.membresia.findMany({ where: { usuarioId }, include: { grupo: true } });
  },
};
