// Lógica pura (sin I/O) de la Unidad 1, extraída para poder probarla con
// pruebas basadas en propiedades (PBT-01..08) sin necesitar base de datos.

export interface SesionMinima {
  estado: 'Activa' | 'Expirada' | 'Invalidada';
  fechaExpiracion: Date;
}

// PROP-05: para cualquier combinación de estado/fechaExpiracion, una sesión
// solo es válida si está Activa y no ha pasado su fecha de expiración.
export function esSesionValida(sesion: SesionMinima, ahora: Date): boolean {
  return sesion.estado === 'Activa' && sesion.fechaExpiracion > ahora;
}

// PROP-06: la nueva expiración calculada tras una renovación siempre debe
// quedar estrictamente después del momento de actividad que la origina.
export function calcularNuevaExpiracion(ahora: Date, duracionMs: number): Date {
  return new Date(ahora.getTime() + duracionMs);
}
