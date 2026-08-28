import { prisma } from '../db/prisma';

export const financieroRepository = {
  crearGasto(data: {
    grupoFamiliarId: string;
    usuarioId: string;
    descripcion: string;
    monto: number;
    categoria: string;
    gastoRecurrenteId?: string;
  }) {
    return prisma.gasto.create({ data });
  },
  listarGastos(grupoFamiliarId: string) {
    return prisma.gasto.findMany({ where: { grupoFamiliarId }, include: { usuario: true }, orderBy: { fecha: 'desc' } });
  },
  actualizarGasto(id: string, grupoFamiliarId: string, data: { descripcion: string; monto: number; categoria: string }) {
    return prisma.gasto.updateMany({ where: { id, grupoFamiliarId }, data });
  },
  eliminarGasto(id: string, grupoFamiliarId: string) {
    return prisma.gasto.deleteMany({ where: { id, grupoFamiliarId } });
  },
  upsertPresupuesto(grupoFamiliarId: string, categoria: string, montoAsignado: number) {
    return prisma.presupuesto.upsert({
      where: { grupoFamiliarId_categoria: { grupoFamiliarId, categoria } },
      update: { montoAsignado },
      create: { grupoFamiliarId, categoria, montoAsignado },
    });
  },
  listarPresupuestos(grupoFamiliarId: string) {
    return prisma.presupuesto.findMany({ where: { grupoFamiliarId } });
  },
  totalesPorCategoria(grupoFamiliarId: string) {
    return prisma.gasto.groupBy({ by: ['categoria'], where: { grupoFamiliarId }, _sum: { monto: true } });
  },
  aportePorMiembro(grupoFamiliarId: string) {
    return prisma.gasto.groupBy({ by: ['usuarioId'], where: { grupoFamiliarId }, _sum: { monto: true }, _count: true });
  },

  crearGastoRecurrente(data: { grupoFamiliarId: string; descripcion: string; monto: number; categoria: string; diaDelMes: number }) {
    return prisma.gastoRecurrente.create({ data });
  },
  listarGastosRecurrentes(grupoFamiliarId: string) {
    return prisma.gastoRecurrente.findMany({ where: { grupoFamiliarId }, orderBy: { diaDelMes: 'asc' } });
  },
  listarGastosRecurrentesActivos(grupoFamiliarId: string) {
    return prisma.gastoRecurrente.findMany({ where: { grupoFamiliarId, activo: true } });
  },
  actualizarActivoGastoRecurrente(id: string, grupoFamiliarId: string, activo: boolean) {
    return prisma.gastoRecurrente.updateMany({ where: { id, grupoFamiliarId }, data: { activo } });
  },
  eliminarGastoRecurrente(id: string, grupoFamiliarId: string) {
    return prisma.gastoRecurrente.deleteMany({ where: { id, grupoFamiliarId } });
  },
  existeGastoGeneradoEnRango(gastoRecurrenteId: string, desde: Date, hasta: Date) {
    return prisma.gasto.findFirst({ where: { gastoRecurrenteId, fecha: { gte: desde, lt: hasta } } });
  },

  crearIngreso(data: { grupoFamiliarId: string; usuarioId: string; descripcion: string; monto: number }) {
    return prisma.ingreso.create({ data });
  },
  listarIngresos(grupoFamiliarId: string) {
    return prisma.ingreso.findMany({ where: { grupoFamiliarId }, include: { usuario: true }, orderBy: { fecha: 'desc' } });
  },
  actualizarIngreso(id: string, grupoFamiliarId: string, data: { descripcion: string; monto: number }) {
    return prisma.ingreso.updateMany({ where: { id, grupoFamiliarId }, data });
  },
  eliminarIngreso(id: string, grupoFamiliarId: string) {
    return prisma.ingreso.deleteMany({ where: { id, grupoFamiliarId } });
  },
};
