import { prisma } from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import { calcularProgreso, calcularSaldo } from './mesada.logic';
import { mesadaRepository } from './mesada.repository';

export const mesadaService = {
  // Un miembro administra su propia cuenta; el administrador del grupo
  // además puede depositar en la de cualquiera (ej. pagar la mesada
  // semanal de un hijo).
  agregarMovimiento(
    grupoFamiliarId: string,
    actorUsuarioId: string,
    actorEsAdmin: boolean,
    targetUsuarioId: string,
    data: { descripcion: string; monto: number },
  ) {
    if (targetUsuarioId !== actorUsuarioId && !actorEsAdmin) {
      throw new AppError(403, 'Solo puedes registrar movimientos en tu propia mesada.');
    }
    if (!data.descripcion?.trim()) throw new AppError(400, 'La descripción es obligatoria.');
    if (!data.monto || data.monto === 0) throw new AppError(400, 'El monto no puede ser cero.');
    return mesadaRepository.crearMovimiento({
      grupoFamiliarId,
      usuarioId: targetUsuarioId,
      descripcion: data.descripcion.trim(),
      monto: data.monto,
    });
  },

  // La mesada de un miembro es privada entre él mismo y el administrador
  // del grupo (los hermanos no ven el detalle del otro).
  async listarMovimientos(
    grupoFamiliarId: string,
    actorUsuarioId: string,
    actorEsAdmin: boolean,
    targetUsuarioId: string,
  ) {
    if (targetUsuarioId !== actorUsuarioId && !actorEsAdmin) {
      throw new AppError(403, 'No puedes ver la mesada de otro miembro.');
    }
    const movimientos = await mesadaRepository.listarMovimientos(grupoFamiliarId, targetUsuarioId);
    return {
      saldo: calcularSaldo(movimientos.map((m) => ({ monto: Number(m.monto) }))),
      movimientos: movimientos.map((m) => ({ id: m.id, descripcion: m.descripcion, monto: Number(m.monto), fecha: m.fecha })),
    };
  },

  // Resumen público del saldo de cada miembro (sin el detalle de
  // movimientos) — transparencia amistosa dentro de la familia.
  async resumenGrupo(grupoFamiliarId: string) {
    const agregados = await mesadaRepository.saldoPorMiembro(grupoFamiliarId);
    const usuarios = await prisma.usuario.findMany({ where: { id: { in: agregados.map((a) => a.usuarioId) } } });
    const nombreDe = new Map(usuarios.map((u) => [u.id, u.nombre]));
    return agregados.map((a) => ({
      usuarioId: a.usuarioId,
      nombre: nombreDe.get(a.usuarioId) ?? 'Miembro',
      saldo: Number(a._sum.monto ?? 0),
    }));
  },

  async agregarMetaAhorro(
    grupoFamiliarId: string,
    actorUsuarioId: string,
    actorEsAdmin: boolean,
    targetUsuarioId: string,
    data: { nombre: string; montoObjetivo: number },
  ) {
    if (targetUsuarioId !== actorUsuarioId && !actorEsAdmin) throw new AppError(403, 'No puedes crear una meta para otro miembro.');
    if (!data.nombre?.trim()) throw new AppError(400, 'La meta necesita un nombre.');
    if (!(data.montoObjetivo > 0)) throw new AppError(400, 'El monto objetivo debe ser mayor a cero.');
    return mesadaRepository.crearMetaAhorro({
      grupoFamiliarId,
      usuarioId: targetUsuarioId,
      nombre: data.nombre.trim(),
      montoObjetivo: data.montoObjetivo,
    });
  },
  async listarMetasAhorro(grupoFamiliarId: string, actorUsuarioId: string, actorEsAdmin: boolean, targetUsuarioId: string) {
    if (targetUsuarioId !== actorUsuarioId && !actorEsAdmin) throw new AppError(403, 'No puedes ver las metas de otro miembro.');
    const [metas, movimientos] = await Promise.all([
      mesadaRepository.listarMetasAhorro(grupoFamiliarId, targetUsuarioId),
      mesadaRepository.listarMovimientos(grupoFamiliarId, targetUsuarioId),
    ]);
    const saldo = calcularSaldo(movimientos.map((m) => ({ monto: Number(m.monto) })));
    return metas.map((m) => ({
      id: m.id,
      nombre: m.nombre,
      montoObjetivo: Number(m.montoObjetivo),
      progreso: calcularProgreso(saldo, Number(m.montoObjetivo)),
    }));
  },
  eliminarMetaAhorro(
    grupoFamiliarId: string,
    actorUsuarioId: string,
    actorEsAdmin: boolean,
    targetUsuarioId: string,
    id: string,
  ) {
    if (targetUsuarioId !== actorUsuarioId && !actorEsAdmin) throw new AppError(403, 'No puedes eliminar la meta de otro miembro.');
    return mesadaRepository.eliminarMetaAhorro(id, grupoFamiliarId, targetUsuarioId);
  },

  // Solo el administrador crea y asigna tareas del hogar (aplicado también
  // vía requireAdmin en la ruta).
  agregarTarea(grupoFamiliarId: string, data: { titulo: string; asignadoAUsuarioId?: string; recompensa?: number }) {
    if (!data.titulo?.trim()) throw new AppError(400, 'La tarea necesita un título.');
    if (data.recompensa !== undefined && !(data.recompensa >= 0)) throw new AppError(400, 'La recompensa no puede ser negativa.');
    return mesadaRepository.crearTarea({
      grupoFamiliarId,
      titulo: data.titulo.trim(),
      asignadoAUsuarioId: data.asignadoAUsuarioId,
      recompensa: data.recompensa ?? 0,
    });
  },
  listarTareas(grupoFamiliarId: string) {
    return mesadaRepository.listarTareas(grupoFamiliarId);
  },
  // Cualquier miembro puede marcar como completada una tarea (reporte
  // propio, mismo criterio que ItemCompra.marcarComprado — BR-18). Si tiene
  // recompensa y estaba asignada, se acredita automáticamente a la mesada
  // del asignado al completarla (y no se revierte si se desmarca, para no
  // generar disputas por plata ya "vista" como ganada).
  async marcarCompletada(grupoFamiliarId: string, id: string, completada: boolean) {
    const tarea = await mesadaRepository.buscarTarea(id, grupoFamiliarId);
    if (!tarea) throw new AppError(404, 'Tarea no encontrada.');
    await mesadaRepository.actualizarCompletadaTarea(id, grupoFamiliarId, completada);
    if (completada && !tarea.completada && tarea.asignadoAUsuarioId && Number(tarea.recompensa) > 0) {
      await mesadaRepository.crearMovimiento({
        grupoFamiliarId,
        usuarioId: tarea.asignadoAUsuarioId,
        descripcion: `Recompensa: ${tarea.titulo}`,
        monto: Number(tarea.recompensa),
      });
    }
  },
  eliminarTarea(grupoFamiliarId: string, id: string) {
    return mesadaRepository.eliminarTarea(id, grupoFamiliarId);
  },
};
