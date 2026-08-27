import { Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { calcularFaltantesParaLista } from './hogar.logic';
import { hogarRepository } from './hogar.repository';

interface Ingrediente {
  n: string;
  cat: string;
}

export const hogarService = {
  agregarProductoAlacena(grupoFamiliarId: string, data: { nombre: string; cantidadTexto: string; icono?: string }) {
    if (!data.nombre?.trim()) throw new AppError(400, 'El producto necesita un nombre.');
    return hogarRepository.crearProductoAlacena({ grupoFamiliarId, ...data });
  },
  listarAlacena(grupoFamiliarId: string) {
    return hogarRepository.listarAlacena(grupoFamiliarId);
  },

  agregarItemCompra(grupoFamiliarId: string, data: { nombre: string; precioEstimado?: number }) {
    if (!data.nombre?.trim()) throw new AppError(400, 'El ítem necesita un nombre.');
    return hogarRepository.crearItemCompra({ grupoFamiliarId, ...data });
  },
  listarCompras(grupoFamiliarId: string) {
    return hogarRepository.listarCompras(grupoFamiliarId);
  },
  // BR-18: idempotente
  marcarComprado(grupoFamiliarId: string, itemId: string, comprado: boolean) {
    return hogarRepository.marcarComprado(itemId, grupoFamiliarId, comprado);
  },

  agregarReceta(
    grupoFamiliarId: string,
    data: { nombre: string; tipos: string[]; tiempoMin: number; porciones: number; ingredientes: Ingrediente[]; pasos: string[] },
  ) {
    if (!data.nombre?.trim()) throw new AppError(400, 'La receta necesita un nombre.');
    return hogarRepository.crearReceta({
      grupoFamiliarId,
      ...data,
      ingredientes: data.ingredientes as unknown as Prisma.InputJsonValue,
    });
  },
  listarRecetas(grupoFamiliarId: string) {
    return hogarRepository.listarRecetas(grupoFamiliarId);
  },

  planificarComida(grupoFamiliarId: string, data: { fecha: string; tipoComida: string; recetaId: string }) {
    return hogarRepository.crearPlanificacion({
      grupoFamiliarId,
      fecha: new Date(data.fecha),
      tipoComida: data.tipoComida,
      recetaId: data.recetaId,
    });
  },

  obtenerCalendarioMes(grupoFamiliarId: string, anio: number, mes: number) {
    const desde = new Date(Date.UTC(anio, mes, 1));
    const hasta = new Date(Date.UTC(anio, mes + 1, 1));
    return hogarRepository.listarPlanificacionesRango(grupoFamiliarId, desde, hasta);
  },

  // BR-19: no duplica ítems ya presentes en la lista
  async generarListaDesdeMenu(grupoFamiliarId: string, anio: number, mes: number) {
    const planificaciones = await this.obtenerCalendarioMes(grupoFamiliarId, anio, mes);
    const ingredientesPlanificados = planificaciones.flatMap(
      (p) => (p.receta.ingredientes as unknown as Ingrediente[])?.map((i) => i.n) ?? [],
    );
    const itemsExistentes = (await hogarRepository.listarCompras(grupoFamiliarId)).map((i) => i.nombre);

    const faltantes = calcularFaltantesParaLista(ingredientesPlanificados, itemsExistentes);
    for (const nombre of faltantes) {
      await hogarRepository.crearItemCompra({ grupoFamiliarId, nombre });
    }
    return { agregados: faltantes };
  },
};
