import { AppError } from '../middleware/errorHandler';
import { enviarNotificacion, pushDisponible, vapidPublicKey } from '../lib/push';
import { notificacionesRepository } from './notificaciones.repository';

export const notificacionesService = {
  estado() {
    return { disponible: pushDisponible(), publicKey: vapidPublicKey() };
  },

  suscribir(usuarioId: string, data: { endpoint: string; p256dh: string; auth: string }) {
    if (!data.endpoint || !data.p256dh || !data.auth) throw new AppError(400, 'Suscripción inválida.');
    return notificacionesRepository.upsertSuscripcion({ usuarioId, ...data });
  },

  desuscribir(endpoint: string) {
    return notificacionesRepository.eliminarSuscripcionPorEndpoint(endpoint);
  },

  // Punto único usado por el resto de la app (gastos grandes, tareas
  // asignadas, nuevos miembros) para avisar a un grupo de usuarios. Si push
  // no está configurado, no hace nada — el resto del flujo no depende de
  // esto (BR: nunca debe romper la acción principal por un fallo de
  // notificación).
  async notificarUsuarios(usuarioIds: string[], payload: { title: string; body: string; url?: string }): Promise<void> {
    if (!pushDisponible() || usuarioIds.length === 0) return;
    try {
      const subs = await notificacionesRepository.listarSuscripcionesDeUsuarios(usuarioIds);
      const invalidas = await enviarNotificacion(subs, payload);
      await Promise.all(invalidas.map((endpoint) => notificacionesRepository.eliminarSuscripcionPorEndpoint(endpoint)));
    } catch {
      // nunca interrumpe el flujo que la disparó (registrar un gasto, asignar una tarea, etc.)
    }
  },
};
