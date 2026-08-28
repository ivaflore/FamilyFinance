import { prisma } from '../db/prisma';
import { geminiDisponible, interpretarBoleta as interpretarBoletaConGemini } from '../lib/gemini';
import { AppError } from '../middleware/errorHandler';
import { calcularEstadoPresupuesto } from './financiero.logic';
import { financieroRepository } from './financiero.repository';

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
};
