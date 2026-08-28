import { Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { DESPENSA_BASE } from './despensa-base';
import { calcularFaltante, calcularFaltantesParaLista } from './hogar.logic';
import { hogarRepository } from './hogar.repository';

interface Ingrediente {
  n: string;
  cat: string;
}

export const hogarService = {
  agregarProductoAlacena(
    grupoFamiliarId: string,
    data: { nombre: string; unidad?: string; cantidadIdeal: number; cantidadActual: number; icono?: string },
  ) {
    if (!data.nombre?.trim()) throw new AppError(400, 'El producto necesita un nombre.');
    if (!(data.cantidadIdeal > 0)) throw new AppError(400, 'La cantidad ideal debe ser mayor a cero.');
    if (!(data.cantidadActual >= 0)) throw new AppError(400, 'La cantidad actual no puede ser negativa.');
    return hogarRepository.crearProductoAlacena({ grupoFamiliarId, ...data });
  },
  async listarAlacena(grupoFamiliarId: string) {
    const productos = await hogarRepository.listarAlacena(grupoFamiliarId);
    return productos.map((p) => ({
      id: p.id,
      icono: p.icono,
      nombre: p.nombre,
      unidad: p.unidad,
      cantidadIdeal: Number(p.cantidadIdeal),
      cantidadActual: Number(p.cantidadActual),
      faltante: calcularFaltante(Number(p.cantidadIdeal), Number(p.cantidadActual)),
    }));
  },
  actualizarCantidadActual(grupoFamiliarId: string, id: string, cantidadActual: number) {
    if (!(cantidadActual >= 0)) throw new AppError(400, 'La cantidad actual no puede ser negativa.');
    return hogarRepository.actualizarCantidadActual(id, grupoFamiliarId, cantidadActual);
  },

  agregarItemCompra(grupoFamiliarId: string, data: { nombre: string; precioEstimado?: number }) {
    if (!data.nombre?.trim()) throw new AppError(400, 'El ítem necesita un nombre.');
    return hogarRepository.crearItemCompra({ grupoFamiliarId, ...data });
  },
  // Nombres (normalizados) de los ingredientes requeridos por el menú
  // planificado del mes actual y del mes siguiente — se usa para explicar
  // POR QUÉ se sugiere comprar un producto (BR-20b).
  async origenesDesdeMenu(grupoFamiliarId: string): Promise<Set<string>> {
    const ahora = new Date();
    const desde = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), 1));
    const hasta = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() + 2, 1));
    const planificaciones = await hogarRepository.listarPlanificacionesRango(grupoFamiliarId, desde, hasta);
    const nombres = new Set<string>();
    for (const p of planificaciones) {
      const ingredientes = (p.receta.ingredientes as unknown as Ingrediente[]) ?? [];
      for (const i of ingredientes) nombres.add(i.n.trim().toLowerCase());
    }
    return nombres;
  },

  // BR-20: la lista de compras combina los productos de la alacena por debajo
  // de su cantidad ideal (sugeridos, con la cantidad propuesta a comprar y el
  // motivo — abastecimiento habitual o receta del menú planificado) con los
  // ítems sueltos agregados a mano.
  async listarCompras(grupoFamiliarId: string) {
    const [alacena, manuales, origenesReceta] = await Promise.all([
      this.listarAlacena(grupoFamiliarId),
      hogarRepository.listarCompras(grupoFamiliarId),
      this.origenesDesdeMenu(grupoFamiliarId),
    ]);
    return {
      sugeridos: alacena
        .filter((p) => p.faltante > 0)
        .map((p) => ({
          ...p,
          origen: (origenesReceta.has(p.nombre.trim().toLowerCase()) ? 'receta' : 'alacena') as 'receta' | 'alacena',
        })),
      manuales,
    };
  },
  // BR-18: idempotente
  marcarComprado(grupoFamiliarId: string, itemId: string, comprado: boolean) {
    return hogarRepository.marcarComprado(itemId, grupoFamiliarId, comprado);
  },

  listarDespensaBase() {
    return DESPENSA_BASE;
  },
  // No duplica productos que el grupo ya mantiene en su alacena (mismo
  // criterio de idempotencia que generarListaDesdeMenu, BR-19). Los que se
  // importan quedan con cantidadActual = 0, así aparecen de inmediato como
  // sugeridos en la lista de compras.
  async importarDespensaBase(grupoFamiliarId: string) {
    const existentes = (await hogarRepository.listarAlacena(grupoFamiliarId)).map((p) => p.nombre);
    const nombresFaltantes = new Set(
      calcularFaltantesParaLista(
        DESPENSA_BASE.map((p) => p.nombre),
        existentes,
      ).map((n) => n.trim().toLowerCase()),
    );
    const aImportar = DESPENSA_BASE.filter((p) => nombresFaltantes.has(p.nombre.trim().toLowerCase()));
    for (const item of aImportar) {
      await hogarRepository.crearProductoAlacena({
        grupoFamiliarId,
        nombre: item.nombre,
        unidad: item.unidad,
        cantidadIdeal: item.cantidadIdeal,
        cantidadActual: 0,
        icono: item.icono,
      });
    }
    return { agregados: aImportar.map((p) => p.nombre) };
  },

  listarRecetasPlantilla() {
    return hogarRepository.listarRecetasPlantilla();
  },
  async importarRecetaPlantilla(grupoFamiliarId: string, plantillaId: string) {
    const plantilla = await hogarRepository.buscarRecetaPlantilla(plantillaId);
    if (!plantilla) throw new AppError(404, 'Receta sugerida no encontrada.');
    return hogarRepository.crearReceta({
      grupoFamiliarId,
      nombre: plantilla.nombre,
      tipos: plantilla.tipos,
      tiempoMin: plantilla.tiempoMin,
      porciones: plantilla.porciones,
      ingredientes: plantilla.ingredientes as Prisma.InputJsonValue,
      pasos: plantilla.pasos,
    });
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

  // BR-19: no duplica productos ya presentes en la alacena. Los ingredientes
  // del menú planificado que el grupo todavía no mantiene como producto de
  // alacena se agregan con cantidadActual = 0, por lo que aparecen de
  // inmediato como sugeridos en la lista de compras (BR-20).
  async generarListaDesdeMenu(grupoFamiliarId: string, anio: number, mes: number) {
    const planificaciones = await this.obtenerCalendarioMes(grupoFamiliarId, anio, mes);
    const ingredientesPlanificados = planificaciones.flatMap(
      (p) => (p.receta.ingredientes as unknown as Ingrediente[])?.map((i) => i.n) ?? [],
    );
    const productosExistentes = (await hogarRepository.listarAlacena(grupoFamiliarId)).map((p) => p.nombre);

    const faltantes = calcularFaltantesParaLista(ingredientesPlanificados, productosExistentes);
    for (const nombre of faltantes) {
      await hogarRepository.crearProductoAlacena({ grupoFamiliarId, nombre, cantidadIdeal: 1, cantidadActual: 0 });
    }
    return { agregados: faltantes };
  },
};
