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
  async agregarProductoAlacena(
    grupoFamiliarId: string,
    data: {
      nombre: string;
      unidad?: string;
      categoria?: string;
      cantidadIdeal: number;
      cantidadActual: number;
      precioEstimado?: number;
      icono?: string;
    },
  ) {
    if (!data.nombre?.trim()) throw new AppError(400, 'El producto necesita un nombre.');
    if (!(data.cantidadIdeal > 0)) throw new AppError(400, 'La cantidad ideal debe ser mayor a cero.');
    if (!(data.cantidadActual >= 0)) throw new AppError(400, 'La cantidad actual no puede ser negativa.');
    if (data.precioEstimado !== undefined && !(data.precioEstimado >= 0)) {
      throw new AppError(400, 'El precio estimado no puede ser negativo.');
    }
    const nombre = data.nombre.trim();
    const existente = await hogarRepository.buscarProductoAlacenaPorNombre(grupoFamiliarId, nombre);
    if (existente) throw new AppError(409, `"${nombre}" ya está en tu alacena. Edítalo en vez de agregarlo de nuevo.`);
    return hogarRepository.crearProductoAlacena({ grupoFamiliarId, ...data, nombre });
  },
  async listarAlacena(grupoFamiliarId: string) {
    const productos = await hogarRepository.listarAlacena(grupoFamiliarId);
    return productos.map((p) => ({
      id: p.id,
      icono: p.icono,
      nombre: p.nombre,
      unidad: p.unidad,
      categoria: p.categoria,
      cantidadIdeal: Number(p.cantidadIdeal),
      cantidadActual: Number(p.cantidadActual),
      precioEstimado: Number(p.precioEstimado),
      faltante: calcularFaltante(Number(p.cantidadIdeal), Number(p.cantidadActual)),
    }));
  },
  actualizarCantidadActual(grupoFamiliarId: string, id: string, cantidadActual: number) {
    if (!(cantidadActual >= 0)) throw new AppError(400, 'La cantidad actual no puede ser negativa.');
    return hogarRepository.actualizarCantidadActual(id, grupoFamiliarId, cantidadActual);
  },
  async actualizarProductoAlacena(
    grupoFamiliarId: string,
    id: string,
    data: { nombre: string; unidad: string; categoria: string; cantidadIdeal: number; cantidadActual: number; precioEstimado: number },
  ) {
    if (!data.nombre?.trim()) throw new AppError(400, 'El producto necesita un nombre.');
    if (!(data.cantidadIdeal > 0)) throw new AppError(400, 'La cantidad ideal debe ser mayor a cero.');
    if (!(data.cantidadActual >= 0)) throw new AppError(400, 'La cantidad actual no puede ser negativa.');
    if (!(data.precioEstimado >= 0)) throw new AppError(400, 'El precio estimado no puede ser negativo.');
    const nombre = data.nombre.trim();
    const existente = await hogarRepository.buscarProductoAlacenaPorNombre(grupoFamiliarId, nombre, id);
    if (existente) throw new AppError(409, `"${nombre}" ya está en tu alacena. Edítalo en vez de duplicarlo.`);
    return hogarRepository.actualizarProductoAlacena(id, grupoFamiliarId, { ...data, nombre });
  },
  eliminarProductoAlacena(grupoFamiliarId: string, id: string) {
    return hogarRepository.eliminarProductoAlacena(id, grupoFamiliarId);
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
        categoria: item.categoria,
        cantidadIdeal: item.cantidadIdeal,
        cantidadActual: 0,
        precioEstimado: item.precioEstimado,
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
  actualizarPlanificacion(grupoFamiliarId: string, id: string, data: { fecha: string; tipoComida: string; recetaId: string }) {
    return hogarRepository.actualizarPlanificacion(id, grupoFamiliarId, {
      fecha: new Date(data.fecha),
      tipoComida: data.tipoComida,
      recetaId: data.recetaId,
    });
  },
  eliminarPlanificacion(grupoFamiliarId: string, id: string) {
    return hogarRepository.eliminarPlanificacion(id, grupoFamiliarId);
  },

  // Cada comida planificada se marca "disponible" si TODOS sus ingredientes
  // están en la alacena con stock (cantidadActual > 0) — el semáforo del
  // menú del mes. "faltantes" son los nombres que no están en stock, listos
  // para agregarSe a la alacena/lista de compras con un clic.
  async obtenerCalendarioMes(grupoFamiliarId: string, anio: number, mes: number) {
    const desde = new Date(Date.UTC(anio, mes, 1));
    const hasta = new Date(Date.UTC(anio, mes + 1, 1));
    const [planificaciones, alacena] = await Promise.all([
      hogarRepository.listarPlanificacionesRango(grupoFamiliarId, desde, hasta),
      this.listarAlacena(grupoFamiliarId),
    ]);
    const nombresEnStock = alacena.filter((p) => p.cantidadActual > 0).map((p) => p.nombre);
    return planificaciones.map((p) => {
      const ingredientes = (p.receta.ingredientes as unknown as Ingrediente[])?.map((i) => i.n) ?? [];
      const faltantes = calcularFaltantesParaLista(ingredientes, nombresEnStock);
      return { ...p, disponible: faltantes.length === 0, faltantes };
    });
  },

  // Agrega a la alacena (cantidadActual = 0, sin duplicar lo ya existente —
  // BR-19) los ingredientes de UNA receta puntual que todavía no se
  // mantienen como producto, para que aparezcan en la lista de compras.
  async agregarFaltantesReceta(grupoFamiliarId: string, recetaId: string) {
    const recetas = await hogarRepository.listarRecetas(grupoFamiliarId);
    const receta = recetas.find((r) => r.id === recetaId);
    if (!receta) throw new AppError(404, 'Receta no encontrada.');
    const ingredientes = (receta.ingredientes as unknown as Ingrediente[])?.map((i) => i.n) ?? [];
    const productosExistentes = (await hogarRepository.listarAlacena(grupoFamiliarId)).map((p) => p.nombre);

    const faltantes = calcularFaltantesParaLista(ingredientes, productosExistentes);
    for (const nombre of faltantes) {
      await hogarRepository.crearProductoAlacena({ grupoFamiliarId, nombre, cantidadIdeal: 1, cantidadActual: 0 });
    }
    return { agregados: faltantes };
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
