// Lógica pura de la Unidad 2, testable con PBT sin base de datos.

export interface InvitacionMinima {
  estado: 'Pendiente' | 'Aceptada' | 'Expirada' | 'Revocada';
  fechaExpiracion: Date;
}

// BR-11: una invitación solo puede aceptarse si no fue revocada y no expiró.
export function invitacionEsAceptable(inv: InvitacionMinima, ahora: Date): boolean {
  return inv.estado !== 'Revocada' && inv.fechaExpiracion > ahora;
}

// BR-12: nunca permitir que un grupo quede con 0 administradores.
export function puedeRemoverAdministrador(totalAdministradoresActual: number): boolean {
  return totalAdministradoresActual > 1;
}
