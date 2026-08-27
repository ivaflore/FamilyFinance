import assert from 'node:assert/strict';
import test from 'node:test';
import fc from 'fast-check';
import { calcularResumenSegmentacion } from '../src/insights/insights.logic';

const arbProducto = fc.record({
  precioUnitario: fc.float({ min: 0, max: 50_000, noNaN: true }),
  cantidad: fc.integer({ min: 0, max: 20 }),
  segmento: fc.constantFrom<'cat1' | 'cat2' | 'saving'>('cat1', 'cat2', 'saving'),
});

// PROP-18: el resumen de segmentación reparte el 100% del total entre los
// 3 segmentos — nunca se pierde ni se duplica valor.
test('PROP-18: la suma del resumen por segmento es igual al total de todos los productos', () => {
  fc.assert(
    fc.property(fc.array(arbProducto, { maxLength: 50 }), (productos) => {
      const resumen = calcularResumenSegmentacion(productos);
      const totalResumen = resumen.cat1 + resumen.cat2 + resumen.saving;
      const totalProductos = productos.reduce((a, p) => a + p.precioUnitario * p.cantidad, 0);
      assert.ok(Math.abs(totalResumen - totalProductos) < 1e-6);
    }),
  );
});
