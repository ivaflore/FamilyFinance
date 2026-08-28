import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

export const hogarRepository = {
  crearProductoAlacena(data: {
    grupoFamiliarId: string;
    nombre: string;
    unidad?: string;
    categoria?: string;
    cantidadIdeal: number;
    cantidadActual: number;
    precioEstimado?: number;
    icono?: string;
  }) {
    return prisma.productoAlacena.create({ data });
  },
  listarAlacena(grupoFamiliarId: string) {
    return prisma.productoAlacena.findMany({ where: { grupoFamiliarId }, orderBy: { nombre: 'asc' } });
  },
  buscarProductoAlacenaPorNombre(grupoFamiliarId: string, nombre: string, excluirId?: string) {
    return prisma.productoAlacena.findFirst({
      where: { grupoFamiliarId, nombre: { equals: nombre, mode: 'insensitive' }, id: excluirId ? { not: excluirId } : undefined },
    });
  },
  actualizarCantidadActual(id: string, grupoFamiliarId: string, cantidadActual: number) {
    return prisma.productoAlacena.updateMany({ where: { id, grupoFamiliarId }, data: { cantidadActual } });
  },
  actualizarProductoAlacena(
    id: string,
    grupoFamiliarId: string,
    data: { nombre: string; unidad: string; categoria: string; cantidadIdeal: number; cantidadActual: number; precioEstimado: number },
  ) {
    return prisma.productoAlacena.updateMany({ where: { id, grupoFamiliarId }, data });
  },
  eliminarProductoAlacena(id: string, grupoFamiliarId: string) {
    return prisma.productoAlacena.deleteMany({ where: { id, grupoFamiliarId } });
  },

  crearItemCompra(data: { grupoFamiliarId: string; nombre: string; precioEstimado?: number }) {
    return prisma.itemCompra.create({ data });
  },
  listarCompras(grupoFamiliarId: string) {
    return prisma.itemCompra.findMany({ where: { grupoFamiliarId } });
  },
  marcarComprado(id: string, grupoFamiliarId: string, comprado: boolean) {
    return prisma.itemCompra.updateMany({ where: { id, grupoFamiliarId }, data: { comprado } });
  },
  buscarItemPorNombre(grupoFamiliarId: string, nombre: string) {
    return prisma.itemCompra.findFirst({ where: { grupoFamiliarId, nombre: { equals: nombre, mode: 'insensitive' } } });
  },

  listarRecetasPlantilla() {
    return prisma.recetaPlantilla.findMany();
  },
  buscarRecetaPlantilla(id: string) {
    return prisma.recetaPlantilla.findUnique({ where: { id } });
  },

  crearReceta(data: {
    grupoFamiliarId: string;
    nombre: string;
    tipos: string[];
    tiempoMin: number;
    porciones: number;
    ingredientes: Prisma.InputJsonValue;
    pasos: string[];
    linkVideo?: string;
  }) {
    return prisma.receta.create({ data });
  },
  listarRecetas(grupoFamiliarId: string) {
    return prisma.receta.findMany({ where: { grupoFamiliarId } });
  },

  crearPlanificacion(data: { grupoFamiliarId: string; fecha: Date; tipoComida: string; recetaId: string }) {
    return prisma.planificacionDia.create({ data });
  },
  actualizarPlanificacion(id: string, grupoFamiliarId: string, data: { fecha: Date; tipoComida: string; recetaId: string }) {
    return prisma.planificacionDia.updateMany({ where: { id, grupoFamiliarId }, data });
  },
  eliminarPlanificacion(id: string, grupoFamiliarId: string) {
    return prisma.planificacionDia.deleteMany({ where: { id, grupoFamiliarId } });
  },
  listarPlanificacionesRango(grupoFamiliarId: string, desde: Date, hasta: Date) {
    return prisma.planificacionDia.findMany({
      where: { grupoFamiliarId, fecha: { gte: desde, lt: hasta } },
      include: { receta: true },
    });
  },
};
