import { prisma } from '../db/prisma';

export const insightsRepository = {
  listarProductosSegmentados(grupoFamiliarId: string) {
    return prisma.productoSegmentado.findMany({ where: { grupoFamiliarId } });
  },
  actualizarSegmento(id: string, grupoFamiliarId: string, segmento: string) {
    return prisma.productoSegmentado.updateMany({ where: { id, grupoFamiliarId }, data: { segmento } });
  },
  crearProductoSegmentado(data: {
    grupoFamiliarId: string;
    nombre: string;
    categoria: string;
    frecuencia: string;
    precioUnitario: number;
    cantidad: number;
    segmento: string;
    justificacion: string;
  }) {
    return prisma.productoSegmentado.create({ data });
  },
};
