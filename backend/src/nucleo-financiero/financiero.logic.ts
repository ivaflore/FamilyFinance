// Lógica pura de la Unidad 3, testable con PBT sin base de datos.

export interface PresupuestoMinimo {
  categoria: string;
  montoAsignado: number;
}

export interface TotalCategoria {
  categoria: string;
  gastado: number;
}

export interface EstadoPresupuestoCategoria {
  categoria: string;
  montoAsignado: number;
  gastado: number;
  disponible: number;
}

// BR-15: el "gastado" de una categoría se deriva SIEMPRE de la suma real de
// gastos (nunca de un contador aparte), eliminando el riesgo de
// desincronización que existía en el prototipo original.
export function calcularEstadoPresupuesto(
  presupuestos: PresupuestoMinimo[],
  totales: TotalCategoria[],
): EstadoPresupuestoCategoria[] {
  const gastadoPorCategoria = new Map(totales.map((t) => [t.categoria, t.gastado]));
  return presupuestos.map((p) => {
    const gastado = gastadoPorCategoria.get(p.categoria) ?? 0;
    return { categoria: p.categoria, montoAsignado: p.montoAsignado, gastado, disponible: p.montoAsignado - gastado };
  });
}

export interface GastoMinimo {
  usuarioId: string;
  monto: number;
}

// PROP-11: conservación — la suma de los aportes por miembro siempre es
// igual a la suma total de los gastos del grupo.
export function calcularAportePorMiembro(gastos: GastoMinimo[]): Map<string, { monto: number; transacciones: number }> {
  const resultado = new Map<string, { monto: number; transacciones: number }>();
  for (const g of gastos) {
    const actual = resultado.get(g.usuarioId) ?? { monto: 0, transacciones: 0 };
    actual.monto += g.monto;
    actual.transacciones += 1;
    resultado.set(g.usuarioId, actual);
  }
  return resultado;
}
