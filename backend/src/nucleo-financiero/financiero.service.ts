import { prisma } from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import { calcularEstadoPresupuesto } from './financiero.logic';
import { financieroRepository } from './financiero.repository';

export const financieroService = {
  async registrarGasto(
    grupoFamiliarId: string,
    usuarioId: string,
    data: { descripcion: string; monto: number; categoria: string },
  ) {
    if (!(data.monto > 0)) throw new AppError(400, 'El monto debe ser mayor a cero.'); // BR-14
    if (!data.descripcion?.trim()) throw new AppError(400, 'La descripción es obligatoria.');
    return financieroRepository.crearGasto({
      grupoFamiliarId,
      usuarioId,
      ...data,
      descripcion: data.descripcion.trim(),
    });
  },

  listarGastos(grupoFamiliarId: string) {
    return financieroRepository.listarGastos(grupoFamiliarId);
  },

  definirPresupuesto(grupoFamiliarId: string, categoria: string, monto: number) {
    if (!(monto >= 0)) throw new AppError(400, 'El presupuesto no puede ser negativo.');
    return financieroRepository.upsertPresupuesto(grupoFamiliarId, categoria, monto);
  },

  async estadoPresupuesto(grupoFamiliarId: string) {
    const [presupuestos, totales] = await Promise.all([
      financieroRepository.listarPresupuestos(grupoFamiliarId),
      financieroRepository.totalesPorCategoria(grupoFamiliarId),
    ]);
    return calcularEstadoPresupuesto(
      presupuestos.map((p) => ({ categoria: p.categoria, montoAsignado: Number(p.montoAsignado) })),
      totales.map((t) => ({ categoria: t.categoria, gastado: Number(t._sum.monto ?? 0) })),
    );
  },

  async aportePorMiembro(grupoFamiliarId: string) {
    const agregados = await financieroRepository.aportePorMiembro(grupoFamiliarId);
    const usuarios = await prisma.usuario.findMany({ where: { id: { in: agregados.map((a) => a.usuarioId) } } });
    const nombreDe = new Map(usuarios.map((u) => [u.id, u.nombre]));
    return agregados.map((a) => ({
      usuarioId: a.usuarioId,
      nombre: nombreDe.get(a.usuarioId) ?? 'Miembro',
      monto: Number(a._sum.monto ?? 0),
      transacciones: a._count,
    }));
  },
};
