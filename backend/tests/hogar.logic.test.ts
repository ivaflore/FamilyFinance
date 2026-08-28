import assert from 'node:assert/strict';
import test from 'node:test';
import fc from 'fast-check';
import { calcularFaltante, calcularFaltantesParaLista } from '../src/hogar/hogar.logic';

const arbNombre = fc.stringMatching(/^[a-zA-Z ]{1,20}$/).filter((s) => s.trim().length > 0);
const arbCantidad = fc.float({ min: 0, max: Math.fround(10000), noNaN: true });

// PROP-19: el faltante nunca es negativo, sin importar cuánto exceda cantidadActual a cantidadIdeal.
test('PROP-19: calcularFaltante nunca devuelve un valor negativo', () => {
  fc.assert(
    fc.property(arbCantidad, arbCantidad, (ideal, actual) => {
      assert.ok(calcularFaltante(ideal, actual) >= 0);
    }),
  );
});

// PROP-20: el faltante es exactamente cero si y solo si ya se tiene al menos lo ideal.
test('PROP-20: calcularFaltante es cero exactamente cuando cantidadActual cubre cantidadIdeal', () => {
  fc.assert(
    fc.property(arbCantidad, arbCantidad, (ideal, actual) => {
      assert.equal(calcularFaltante(ideal, actual) === 0, actual >= ideal);
    }),
  );
});

test('ejemplo: faltan 3 unidades si el ideal es 5 y hay 2', () => {
  assert.equal(calcularFaltante(5, 2), 3);
});

test('ejemplo: no falta nada si hay más de lo ideal', () => {
  assert.equal(calcularFaltante(5, 8), 0);
});

// PROP-15: generar la lista dos veces seguidas produce el mismo resultado
// que generarla una vez (idempotencia — no duplica).
test('PROP-15: aplicar los faltantes calculados y volver a calcular da una lista vacía', () => {
  fc.assert(
    fc.property(fc.array(arbNombre, { maxLength: 20 }), fc.array(arbNombre, { maxLength: 20 }), (planificados, existentes) => {
      const faltantes = calcularFaltantesParaLista(planificados, existentes);
      // Si ya agregamos los faltantes a la lista existente, una segunda pasada no debe encontrar más faltantes.
      const segundaPasada = calcularFaltantesParaLista(planificados, [...existentes, ...faltantes]);
      assert.deepEqual(segundaPasada, []);
    }),
  );
});

test('PROP-15b: nunca se agregan duplicados de un mismo ingrediente aunque se repita en el menú', () => {
  fc.assert(
    fc.property(arbNombre, fc.integer({ min: 2, max: 5 }), (nombre, repeticiones) => {
      const planificados = Array(repeticiones).fill(nombre);
      const faltantes = calcularFaltantesParaLista(planificados, []);
      assert.equal(faltantes.length, 1);
    }),
  );
});

test('ejemplo: no duplica un ingrediente que ya está en la lista (sin importar mayúsculas)', () => {
  const faltantes = calcularFaltantesParaLista(['Leche', 'Arroz'], ['leche']);
  assert.deepEqual(faltantes, ['Arroz']);
});
