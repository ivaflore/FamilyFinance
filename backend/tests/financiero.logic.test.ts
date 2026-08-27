import assert from 'node:assert/strict';
import test from 'node:test';
import fc from 'fast-check';
import { calcularAportePorMiembro, calcularEstadoPresupuesto } from '../src/nucleo-financiero/financiero.logic';

const arbGasto = fc.record({
  usuarioId: fc.constantFrom('u1', 'u2', 'u3'),
  monto: fc.float({ min: Math.fround(0.01), max: 100_000, noNaN: true }),
});

// PROP-11: conservación — la suma de aportes por miembro siempre es igual
// a la suma total de los gastos del grupo.
test('PROP-11: la suma de aportes por miembro conserva el total de gastos', () => {
  fc.assert(
    fc.property(fc.array(arbGasto, { maxLength: 50 }), (gastos) => {
      const aportes = calcularAportePorMiembro(gastos);
      const sumaAportes = [...aportes.values()].reduce((a, v) => a + v.monto, 0);
      const sumaGastos = gastos.reduce((a, g) => a + g.monto, 0);
      assert.ok(Math.abs(sumaAportes - sumaGastos) < 1e-6);
    }),
  );
});

// PROP-12: el monto gastado calculado de una categoría nunca es negativo.
test('PROP-12: el gastado calculado por categoría nunca es negativo', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({ categoria: fc.constantFrom('super', 'salud', 'transporte'), gastado: fc.float({ min: 0, max: 100_000, noNaN: true }) }), {
        maxLength: 10,
      }),
      fc.array(fc.record({ categoria: fc.constantFrom('super', 'salud', 'transporte'), montoAsignado: fc.float({ min: 0, max: 200_000, noNaN: true }) }), {
        maxLength: 10,
      }),
      (totales, presupuestos) => {
        const estado = calcularEstadoPresupuesto(presupuestos, totales);
        for (const e of estado) {
          assert.ok(e.gastado >= 0);
        }
      },
    ),
  );
});

test('ejemplo: presupuesto de $200.000 con $50.000 gastados deja $150.000 disponibles', () => {
  const estado = calcularEstadoPresupuesto([{ categoria: 'super', montoAsignado: 200_000 }], [{ categoria: 'super', gastado: 50_000 }]);
  assert.equal(estado[0].disponible, 150_000);
});
