import assert from 'node:assert/strict';
import test from 'node:test';
import fc from 'fast-check';
import { calcularProgreso, calcularSaldo } from '../src/mesada/mesada.logic';

const arbMonto = fc.float({ min: Math.fround(-100_000), max: Math.fround(100_000), noNaN: true });

// PROP-21: el saldo conserva la suma exacta de todos los movimientos.
test('PROP-21: calcularSaldo conserva la suma de los movimientos', () => {
  fc.assert(
    fc.property(fc.array(fc.record({ monto: arbMonto }), { maxLength: 50 }), (movimientos) => {
      const saldo = calcularSaldo(movimientos);
      const sumaEsperada = movimientos.reduce((a, m) => a + m.monto, 0);
      assert.ok(Math.abs(saldo - sumaEsperada) < 1e-6);
    }),
  );
});

// PROP-22: el progreso siempre queda entre 0 y 100, sin importar el saldo.
test('PROP-22: calcularProgreso siempre esta entre 0 y 100', () => {
  fc.assert(
    fc.property(arbMonto, fc.float({ min: Math.fround(0.01), max: 1_000_000, noNaN: true }), (saldo, objetivo) => {
      const progreso = calcularProgreso(saldo, objetivo);
      assert.ok(progreso >= 0 && progreso <= 100);
    }),
  );
});

test('ejemplo: saldo de $30.000 sobre una meta de $60.000 es 50% de progreso', () => {
  assert.equal(calcularProgreso(30_000, 60_000), 50);
});

test('ejemplo: sin meta definida (objetivo 0) el progreso es 0', () => {
  assert.equal(calcularProgreso(10_000, 0), 0);
});
