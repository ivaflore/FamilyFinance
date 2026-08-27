import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

export const hogarRepository = {
  crearProductoAlacena(data: { grupoFamiliarId: string; nombre: string; cantidadTexto: string; icono?: string }) {
    return prisma.productoAlacena.create({ data });
  },
  listarAlacena(grupoFamiliarId: string) {
    return prisma.productoAlacena.findMany({ where: { grupoFamiliarId } });
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

  crearReceta(data: {
    grupoFamiliarId: string;
    nombre: string;
    tipos: string[];
    tiempoMin: number;
    porciones: number;
    ingredientes: Prisma.InputJsonValue;
    pasos: string[];
  }) {
    return prisma.receta.create({ data });
  },
  listarRecetas(grupoFamiliarId: string) {
    return prisma.receta.findMany({ where: { grupoFamiliarId } });
  },

  crearPlanificacion(data: { grupoFamiliarId: string; fecha: Date; tipoComida: string; recetaId: string }) {
    return prisma.planificacionDia.create({ data });
  },
  listarPlanificacionesRango(grupoFamiliarId: string, desde: Date, hasta: Date) {
    return prisma.planificacionDia.findMany({
      where: { grupoFamiliarId, fecha: { gte: desde, lt: hasta } },
      include: { receta: true },
    });
  },
};
