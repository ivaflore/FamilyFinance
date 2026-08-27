// Lógica pura de la Unidad 5, testable con PBT sin base de datos.

export interface ProductoSegmentadoMinimo {
  precioUnitario: number;
  cantidad: number;
  segmento: 'cat1' | 'cat2' | 'saving';
}

// PROP-18: el resumen de segmentación siempre reparte el 100% del total
// entre los 3 segmentos — nunca se "pierde" ni se "duplica" valor.
export function calcularResumenSegmentacion(productos: ProductoSegmentadoMinimo[]): {
  cat1: number;
  cat2: number;
  saving: number;
} {
  const resumen = { cat1: 0, cat2: 0, saving: 0 };
  for (const p of productos) {
    resumen[p.segmento] += p.precioUnitario * p.cantidad;
  }
  return resumen;
}
