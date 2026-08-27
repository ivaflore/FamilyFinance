import { prisma } from '../db/prisma';

export const financieroRepository = {
  crearGasto(data: { grupoFamiliarId: string; usuarioId: string; descripcion: string; monto: number; categoria: string }) {
    return prisma.gasto.create({ data });
  },
  listarGastos(grupoFamiliarId: string) {
    return prisma.gasto.findMany({ where: { grupoFamiliarId }, include: { usuario: true }, orderBy: { fecha: 'desc' } });
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
};
