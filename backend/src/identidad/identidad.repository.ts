import { prisma } from '../db/prisma';

export const identidadRepository = {
  buscarPorGoogleSub(googleSub: string) {
    return prisma.usuario.findUnique({ where: { googleSub } });
  },
  crear(data: { googleSub: string; correo: string; nombre: string; fotoUrl?: string }) {
    return prisma.usuario.create({ data });
  },
  actualizarUltimoLogin(id: string) {
    return prisma.usuario.update({ where: { id }, data: { fechaUltimoLogin: new Date() } });
  },
  crearSesion(usuarioId: string, tokenHash: string, expiracion: Date) {
    return prisma.sesion.create({ data: { token: tokenHash, usuarioId, fechaExpiracion: expiracion } });
  },
  invalidarSesion(tokenHash: string) {
    // BR-05: idempotente — invalidar dos veces no produce error ni cambia el resultado
    return prisma.sesion.updateMany({
      where: { token: tokenHash },
      data: { estado: 'Invalidada', fechaInvalidacion: new Date() },
    });
  },
  buscarPorId(id: string) {
    return prisma.usuario.findUnique({ where: { id } });
  },
};
