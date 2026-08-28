import { prisma } from '../db/prisma';

export const notificacionesRepository = {
  upsertSuscripcion(data: { usuarioId: string; endpoint: string; p256dh: string; auth: string }) {
    return prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      update: { p256dh: data.p256dh, auth: data.auth, usuarioId: data.usuarioId },
      create: data,
    });
  },
  eliminarSuscripcionPorEndpoint(endpoint: string) {
    return prisma.pushSubscription.deleteMany({ where: { endpoint } });
  },
  listarSuscripcionesDeUsuarios(usuarioIds: string[]) {
    return prisma.pushSubscription.findMany({ where: { usuarioId: { in: usuarioIds } } });
  },
};
