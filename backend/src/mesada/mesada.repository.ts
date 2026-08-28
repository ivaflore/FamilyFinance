import { prisma } from '../db/prisma';

export const mesadaRepository = {
  crearMovimiento(data: { grupoFamiliarId: string; usuarioId: string; descripcion: string; monto: number }) {
    return prisma.movimientoMesada.create({ data });
  },
  listarMovimientos(grupoFamiliarId: string, usuarioId: string) {
    return prisma.movimientoMesada.findMany({ where: { grupoFamiliarId, usuarioId }, orderBy: { fecha: 'desc' } });
  },
  saldoPorMiembro(grupoFamiliarId: string) {
    return prisma.movimientoMesada.groupBy({ by: ['usuarioId'], where: { grupoFamiliarId }, _sum: { monto: true } });
  },

  crearMetaAhorro(data: { grupoFamiliarId: string; usuarioId: string; nombre: string; montoObjetivo: number }) {
    return prisma.metaAhorro.create({ data });
  },
  listarMetasAhorro(grupoFamiliarId: string, usuarioId: string) {
    return prisma.metaAhorro.findMany({ where: { grupoFamiliarId, usuarioId, activa: true }, orderBy: { fechaCreacion: 'desc' } });
  },
  eliminarMetaAhorro(id: string, grupoFamiliarId: string, usuarioId: string) {
    return prisma.metaAhorro.deleteMany({ where: { id, grupoFamiliarId, usuarioId } });
  },

  crearTarea(data: { grupoFamiliarId: string; titulo: string; asignadoAUsuarioId?: string; recompensa: number }) {
    return prisma.tarea.create({ data });
  },
  listarTareas(grupoFamiliarId: string) {
    return prisma.tarea.findMany({
      where: { grupoFamiliarId },
      include: { asignadoA: true },
      orderBy: [{ completada: 'asc' }, { fechaCreacion: 'desc' }],
    });
  },
  buscarTarea(id: string, grupoFamiliarId: string) {
    return prisma.tarea.findFirst({ where: { id, grupoFamiliarId } });
  },
  actualizarCompletadaTarea(id: string, grupoFamiliarId: string, completada: boolean) {
    return prisma.tarea.updateMany({ where: { id, grupoFamiliarId }, data: { completada } });
  },
  eliminarTarea(id: string, grupoFamiliarId: string) {
    return prisma.tarea.deleteMany({ where: { id, grupoFamiliarId } });
  },
};
