import { prisma } from '../db/prisma';
import { geminiDisponible, interpretarBoleta as interpretarBoletaConGemini } from '../lib/gemini';
import { AppError } from '../middleware/errorHandler';
import { notificacionesService } from '../notificaciones/notificaciones.service';
import { calcularEstadoPresupuesto } from './financiero.logic';
import { financieroRepository } from './financiero.repository';

// Umbral (CLP) a partir del cual un gasto se considera "grande" y avisa al
// resto del grupo por notificación push — puramente informativo.
const UMBRAL_GASTO_GRANDE = 50_000;

// Debe reflejar exactamente las categorías que ofrece el selector del
// frontend (frontend/src/panels/financiero.ts) — se usan aquí solo como
// sugerencia acotada para el escaneo de boletas por IA, no como un enum
// impuesto en la base de datos (categoria sigue siendo texto libre).
export const CATEGORIAS_GASTO = [
  'Vivienda',
  'Servicios Básicos',
  'Alimentación Central',
  'Transporte Diario',
  'Salud y Seguros',
  'Educación o Deudas',
  'Salidas y Ocio',
  'Suscripciones Digitales',
  'Cuidado Personal',
  'Ropa y Calzado',
  'Gastos Hormiga',
  'Tecnología y Hogar',
  'Fondo de Emergencia',
  'Inversión o Metas',
];

export const financieroService = {
  async registrarGasto(
    grupoFamiliarId: string,
    usuarioId: string,
    data: { descripcion: string; monto: number; categoria: string },
  ) {
    if (!(data.monto > 0)) throw new AppError(400, 'El monto debe ser mayor a cero.'); // BR-14
    if (!data.descripcion?.trim()) throw new AppError(400, 'La descripción es obligatoria.');
    const gasto = await financieroRepository.crearGasto({
      grupoFamiliarId,
      usuarioId,
      ...data,
      descripcion: data.descripcion.trim(),
    });
    if (data.monto >= UMBRAL_GASTO_GRANDE) {
      const otros = await prisma.membresia.findMany({
        where: { grupoFamiliarId, usuarioId: { not: usuarioId } },
        select: { usuarioId: true },
      });
      notificacionesService.notificarUsuarios(
        otros.map((m) => m.usuarioId),
        { title: 'Gasto grande registrado', body: `${data.descripcion.trim()}: $${data.monto.toLocaleString('es-CL')}`, url: '/#gastos' },
      );
    }
    return gasto;
  },

  listarGastos(grupoFamiliarId: string) {
    return financieroRepository.listarGastos(grupoFamiliarId);
  },

  // BR-09: solo el administrador del grupo puede corregir o eliminar un
  // gasto ya registrado (aplicado en la ruta vía requireAdmin).
  actualizarGasto(grupoFamiliarId: string, id: string, data: { descripcion: string; monto: number; categoria: string }) {
    if (!(data.monto > 0)) throw new AppError(400, 'El monto debe ser mayor a cero.');
    if (!data.descripcion?.trim()) throw new AppError(400, 'La descripción es obligatoria.');
    return financieroRepository.actualizarGasto(id, grupoFamiliarId, { ...data, descripcion: data.descripcion.trim() });
  },
  eliminarGasto(grupoFamiliarId: string, id: string) {
    return financieroRepository.eliminarGasto(id, grupoFamiliarId);
  },

  // Escanea una boleta/recibo fotografiado y extrae monto, comercio y
  // categoría sugerida. No crea el gasto directamente — el usuario confirma
  // o corrige los datos extraídos antes de guardarlos (POST /gastos ya
  // resuelve el usuarioId del lado del servidor, así que "quién lo hizo"
  // queda registrado automáticamente al guardar).
  async interpretarBoleta(imagenBase64: string, mimeType: string) {
    if (!geminiDisponible()) {
      throw new AppError(503, 'El escaneo de boletas no está disponible: falta configurar la integración de IA.');
    }
    try {
      return await interpretarBoletaConGemini(imagenBase64, mimeType, CATEGORIAS_GASTO);
    } catch {
      throw new AppError(422, 'No se pudo leer la boleta. Intenta con una foto más clara o agrega el gasto manualmente.');
    }
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

  // BR: solo el administrador define los gastos fijos del grupo (aplicado
  // vía requireAdmin en la ruta) — son compromisos compartidos, no un
  // gasto puntual de un miembro.
  agregarGastoRecurrente(
    grupoFamiliarId: string,
    data: { descripcion: string; monto: number; categoria: string; diaDelMes: number },
  ) {
    if (!data.descripcion?.trim()) throw new AppError(400, 'La descripción es obligatoria.');
    if (!(data.monto > 0)) throw new AppError(400, 'El monto debe ser mayor a cero.');
    if (!Number.isInteger(data.diaDelMes) || data.diaDelMes < 1 || data.diaDelMes > 28) {
      throw new AppError(400, 'El día del mes debe estar entre 1 y 28.');
    }
    return financieroRepository.crearGastoRecurrente({ ...data, grupoFamiliarId, descripcion: data.descripcion.trim() });
  },
  listarGastosRecurrentes(grupoFamiliarId: string) {
    return financieroRepository.listarGastosRecurrentes(grupoFamiliarId);
  },
  activarGastoRecurrente(grupoFamiliarId: string, id: string, activo: boolean) {
    return financieroRepository.actualizarActivoGastoRecurrente(id, grupoFamiliarId, activo);
  },
  eliminarGastoRecurrente(grupoFamiliarId: string, id: string) {
    return financieroRepository.eliminarGastoRecurrente(id, grupoFamiliarId);
  },

  // Genera el Gasto real del mes para cada plantilla activa que todavía no
  // lo tenga (idempotente: nunca duplica el mismo mes — se verifica por
  // Gasto.gastoRecurrenteId dentro del rango del mes actual). Se llama sola
  // al cargar el resumen financiero, así el gasto fijo aparece para todo el
  // grupo sin que nadie tenga que acordarse de generarlo a mano.
  async generarGastosRecurrentesDelMes(grupoFamiliarId: string, usuarioId: string) {
    const activos = await financieroRepository.listarGastosRecurrentesActivos(grupoFamiliarId);
    const ahora = new Date();
    const desde = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), 1));
    const hasta = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() + 1, 1));

    const generados: string[] = [];
    for (const r of activos) {
      const yaExiste = await financieroRepository.existeGastoGeneradoEnRango(r.id, desde, hasta);
      if (yaExiste) continue;
      await financieroRepository.crearGasto({
        grupoFamiliarId,
        usuarioId,
        descripcion: r.descripcion,
        monto: Number(r.monto),
        categoria: r.categoria,
        gastoRecurrenteId: r.id,
      });
      generados.push(r.descripcion);
    }
    return { generados };
  },

  registrarIngreso(grupoFamiliarId: string, usuarioId: string, data: { descripcion: string; monto: number }) {
    if (!(data.monto > 0)) throw new AppError(400, 'El monto debe ser mayor a cero.');
    if (!data.descripcion?.trim()) throw new AppError(400, 'La descripción es obligatoria.');
    return financieroRepository.crearIngreso({ grupoFamiliarId, usuarioId, ...data, descripcion: data.descripcion.trim() });
  },
  listarIngresos(grupoFamiliarId: string) {
    return financieroRepository.listarIngresos(grupoFamiliarId);
  },
  // BR-09: mismo criterio que los gastos — solo el administrador corrige o elimina.
  actualizarIngreso(grupoFamiliarId: string, id: string, data: { descripcion: string; monto: number }) {
    if (!(data.monto > 0)) throw new AppError(400, 'El monto debe ser mayor a cero.');
    if (!data.descripcion?.trim()) throw new AppError(400, 'La descripción es obligatoria.');
    return financieroRepository.actualizarIngreso(id, grupoFamiliarId, { ...data, descripcion: data.descripcion.trim() });
  },
  eliminarIngreso(grupoFamiliarId: string, id: string) {
    return financieroRepository.eliminarIngreso(id, grupoFamiliarId);
  },
};
