import assert from 'node:assert/strict';
import test from 'node:test';
import fc from 'fast-check';
import { invitacionEsAceptable, puedeRemoverAdministrador } from '../src/grupos-familiares/grupos.logic';

// PROP-07: nunca se permite dejar un grupo sin administradores.
test('PROP-07: solo se puede remover a un administrador si quedará al menos otro', () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 50 }), (totalAdmins) => {
      const puede = puedeRemoverAdministrador(totalAdmins);
      assert.equal(puede, totalAdmins > 1);
    }),
  );
});

// PROP-09 (soporte): una invitación revocada o expirada nunca es aceptable.
test('BR-11: una invitación revocada o expirada nunca es aceptable', () => {
  fc.assert(
    fc.property(
      fc.constantFrom<'Pendiente' | 'Aceptada' | 'Expirada' | 'Revocada'>('Pendiente', 'Aceptada', 'Expirada', 'Revocada'),
      fc.integer({ min: -10_000_000, max: 10_000_000 }),
      (estado, deltaMs) => {
        const ahora = new Date();
        const fechaExpiracion = new Date(ahora.getTime() + deltaMs);
        const aceptable = invitacionEsAceptable({ estado, fechaExpiracion }, ahora);

        if (estado === 'Revocada' || deltaMs <= 0) {
          assert.equal(aceptable, false);
        } else {
          assert.equal(aceptable, true);
        }
      },
    ),
  );
});

test('ejemplo: no se puede remover al único administrador', () => {
  assert.equal(puedeRemoverAdministrador(1), false);
});
