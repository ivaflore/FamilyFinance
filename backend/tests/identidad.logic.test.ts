import assert from 'node:assert/strict';
import test from 'node:test';
import fc from 'fast-check';
import { calcularNuevaExpiracion, esSesionValida } from '../src/identidad/identidad.logic';

// PROP-05: una sesión solo es válida si está Activa y no ha expirado.
test('PROP-05: una sesión Invalidada o Expirada nunca es válida', () => {
  fc.assert(
    fc.property(
      fc.constantFrom<'Activa' | 'Expirada' | 'Invalidada'>('Activa', 'Expirada', 'Invalidada'),
      fc.integer({ min: -10_000_000, max: 10_000_000 }),
      (estado, deltaMs) => {
        const ahora = new Date();
        const fechaExpiracion = new Date(ahora.getTime() + deltaMs);
        const valida = esSesionValida({ estado, fechaExpiracion }, ahora);

        if (estado !== 'Activa') {
          assert.equal(valida, false);
        } else {
          assert.equal(valida, deltaMs > 0);
        }
      },
    ),
  );
});

// PROP-06: la nueva expiración calculada siempre es posterior al momento
// de actividad que la origina.
test('PROP-06: la expiración renovada siempre es posterior al momento de actividad', () => {
  fc.assert(
    fc.property(fc.date({ min: new Date(2020, 0, 1), max: new Date(2035, 0, 1) }), fc.integer({ min: 1, max: 1000 * 60 * 60 * 24 * 30 }), (ahora, duracionMs) => {
      const nueva = calcularNuevaExpiracion(ahora, duracionMs);
      assert.ok(nueva.getTime() > ahora.getTime());
    }),
  );
});

// Ejemplo concreto (PBT-10: complementa las propiedades con casos de regresión pinneados)
test('ejemplo: una sesión Activa con expiración en el futuro es válida', () => {
  const ahora = new Date('2026-01-01T00:00:00Z');
  const sesion = { estado: 'Activa' as const, fechaExpiracion: new Date('2026-01-02T00:00:00Z') };
  assert.equal(esSesionValida(sesion, ahora), true);
});
