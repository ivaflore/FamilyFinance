import assert from 'node:assert/strict';
import test from 'node:test';
import fc from 'fast-check';
import { calcularFaltantesParaLista } from '../src/hogar/hogar.logic';

const arbNombre = fc.stringMatching(/^[a-zA-Z ]{1,20}$/).filter((s) => s.trim().length > 0);

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
