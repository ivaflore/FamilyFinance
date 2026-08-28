// Lógica pura de la Unidad 6, testable con PBT sin base de datos.

// El saldo de la cuenta personal SIEMPRE se deriva de la suma de sus
// movimientos (mismo criterio que BR-15 para el presupuesto) — nunca un
// contador aparte que se pueda desincronizar.
export function calcularSaldo(movimientos: { monto: number }[]): number {
  return movimientos.reduce((total, m) => total + m.monto, 0);
}

// Progreso hacia una meta de ahorro, en porcentaje, nunca negativo ni sobre
// 100 — un saldo negativo no "resta" progreso más allá de 0.
export function calcularProgreso(saldo: number, montoObjetivo: number): number {
  if (!(montoObjetivo > 0)) return 0;
  return Math.max(0, Math.min(100, Math.round((saldo / montoObjetivo) * 100)));
}
