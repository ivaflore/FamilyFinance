// Lógica pura de la Unidad 4, testable con PBT sin base de datos.

// BR-20: la cantidad a comprar de un producto de la alacena es la diferencia
// entre lo que deberíamos tener (cantidadIdeal) y lo que tenemos (cantidadActual),
// nunca negativa (un excedente no "resta" de otro producto).
export function calcularFaltante(cantidadIdeal: number, cantidadActual: number): number {
  return Math.max(0, cantidadIdeal - cantidadActual);
}

// BR-19: dado el conjunto de ingredientes requeridos por el menú planificado
// y los nombres ya presentes en la lista de compras, calcula solo los
// nombres que faltan agregar (normalizados, sin distinguir mayúsculas).
export function calcularFaltantesParaLista(ingredientesPlanificados: string[], itemsExistentes: string[]): string[] {
  const existentesNormalizados = new Set(itemsExistentes.map((n) => n.trim().toLowerCase()));
  const faltantes: string[] = [];
  const yaAgregadosEnEstaEjecucion = new Set<string>();

  for (const nombre of ingredientesPlanificados) {
    const clave = nombre.trim().toLowerCase();
    if (!existentesNormalizados.has(clave) && !yaAgregadosEnEstaEjecucion.has(clave)) {
      faltantes.push(nombre);
      yaAgregadosEnEstaEjecucion.add(clave);
    }
  }
  return faltantes;
}
