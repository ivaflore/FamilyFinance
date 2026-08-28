// Catálogo estático de referencia: una despensa base típica de un hogar
// chileno, con cantidades ideales sugeridas. No requiere tabla en base de
// datos (a diferencia de RecetaPlantilla) porque no se prevé que cambie con
// frecuencia — se sirve tal cual vía /despensa-base y cada grupo puede
// importarla a su propia alacena con un clic (hogarService.importarDespensaBase).
export interface ProductoDespensaBase {
  nombre: string;
  unidad: string;
  cantidadIdeal: number;
  icono: string;
}

export const DESPENSA_BASE: ProductoDespensaBase[] = [
  // Despensa y Abarrotes
  { nombre: 'Arroz', unidad: 'bolsas de 1 kg (grano largo ancho)', cantidadIdeal: 5, icono: '🍚' },
  { nombre: 'Tallarines', unidad: 'paquetes de 400-500 g', cantidadIdeal: 4, icono: '🍝' },
  { nombre: 'Espirales / Corbatitas', unidad: 'paquetes de 400-500 g', cantidadIdeal: 6, icono: '🍝' },
  { nombre: 'Lentejas', unidad: 'bolsas de 1 kg', cantidadIdeal: 2, icono: '🫘' },
  { nombre: 'Porotos (granados o negros)', unidad: 'bolsa de 1 kg', cantidadIdeal: 1, icono: '🫘' },
  { nombre: 'Harina', unidad: 'bolsas de 1 kg (sin polvos de hornear)', cantidadIdeal: 2, icono: '🌾' },
  { nombre: 'Aceite vegetal', unidad: 'botellas de 1 litro', cantidadIdeal: 4, icono: '🫗' },
  { nombre: 'Salsa de tomate', unidad: 'cajitas de 200 g', cantidadIdeal: 10, icono: '🍅' },
  { nombre: 'Atún en conserva', unidad: 'latas (en agua o aceite)', cantidadIdeal: 6, icono: '🐟' },
  { nombre: 'Jurel en conserva', unidad: 'tarros grandes', cantidadIdeal: 3, icono: '🐟' },
  { nombre: 'Puré de papas', unidad: 'cajas familiares', cantidadIdeal: 2, icono: '🥔' },
  { nombre: 'Avena instantánea', unidad: 'bolsa de 1 kg', cantidadIdeal: 1, icono: '🥣' },
  { nombre: 'Caldo concentrado', unidad: 'pack de 12 tabletas (carne/pollo)', cantidadIdeal: 1, icono: '🧂' },
  { nombre: 'Sopas en sobre', unidad: 'unidades variadas', cantidadIdeal: 4, icono: '🥫' },

  // Proteínas y Congelados
  { nombre: 'Pechuga de pollo', unidad: 'bandejas deshuesadas (~2 kg total)', cantidadIdeal: 2, icono: '🍗' },
  { nombre: 'Trutro de pollo', unidad: 'kg (entero o cuarto)', cantidadIdeal: 3, icono: '🍗' },
  { nombre: 'Carne molida', unidad: 'kg (baja en grasa)', cantidadIdeal: 2, icono: '🥩' },
  { nombre: 'Carne vacuna para guiso', unidad: 'kg (posta negra, rosada o asiento)', cantidadIdeal: 2, icono: '🥩' },
  { nombre: 'Pulpa de cerdo', unidad: 'kg (en cubos o chuletas)', cantidadIdeal: 1.5, icono: '🥩' },
  { nombre: 'Pescado congelado', unidad: 'bolsas de 1 kg (merluza o reineta)', cantidadIdeal: 2, icono: '🐟' },
  { nombre: 'Vienesas', unidad: 'paquetes grandes (tradicional o pavo)', cantidadIdeal: 2, icono: '🌭' },
  { nombre: 'Longanizas / Chorizos', unidad: 'paquete', cantidadIdeal: 1, icono: '🌭' },

  // Lácteos, Huevos y Fiambrería
  { nombre: 'Huevos', unidad: 'bandejas de 30 unidades (60 en total)', cantidadIdeal: 2, icono: '🥚' },
  { nombre: 'Leche entera / descremada', unidad: 'cajas de 12 litros (24 litros total)', cantidadIdeal: 2, icono: '🥛' },
  { nombre: 'Queso laminado', unidad: 'envases familiares de 500 g (gauda o mantecoso)', cantidadIdeal: 3, icono: '🧀' },
  { nombre: 'Jamón', unidad: 'envases de 250 g (pierna o pavo)', cantidadIdeal: 4, icono: '🍖' },
  { nombre: 'Mantequilla', unidad: 'panes de 250 g', cantidadIdeal: 4, icono: '🧈' },
  { nombre: 'Yogurt', unidad: 'packs de 8 unidades', cantidadIdeal: 4, icono: '🥛' },
  { nombre: 'Pan de molde', unidad: 'bolsas grandes', cantidadIdeal: 4, icono: '🍞' },

  // Frutas y Verduras (base de guarda)
  { nombre: 'Papas', unidad: 'malla de 10 kg', cantidadIdeal: 1, icono: '🥔' },
  { nombre: 'Cebollas', unidad: 'malla de 3 kg', cantidadIdeal: 1, icono: '🧅' },
  { nombre: 'Zanahorias', unidad: 'bolsa de 2 kg', cantidadIdeal: 1, icono: '🥕' },
  { nombre: 'Ajo', unidad: 'malla de 5-6 cabezas', cantidadIdeal: 1, icono: '🧄' },
  { nombre: 'Tomates', unidad: 'kg', cantidadIdeal: 4, icono: '🍅' },
  { nombre: 'Limones', unidad: 'kg', cantidadIdeal: 1, icono: '🍋' },
  { nombre: 'Lechuga', unidad: 'plantas', cantidadIdeal: 2, icono: '🥬' },
  { nombre: 'Apio', unidad: 'mata grande', cantidadIdeal: 1, icono: '🥬' },
  { nombre: 'Primavera de verduras congelada', unidad: 'bolsas de 1 kg', cantidadIdeal: 2, icono: '🥦' },
  { nombre: 'Manzanas', unidad: 'kg', cantidadIdeal: 4, icono: '🍎' },
  { nombre: 'Naranjas', unidad: 'kg', cantidadIdeal: 3, icono: '🍊' },
  { nombre: 'Plátanos', unidad: 'compra quincenal', cantidadIdeal: 1, icono: '🍌' },

  // Desayuno, Especias y Dulces
  { nombre: 'Té', unidad: 'caja de 100 bolsitas', cantidadIdeal: 1, icono: '🍵' },
  { nombre: 'Café instantáneo', unidad: 'tarro/bolsa de 170 g', cantidadIdeal: 1, icono: '☕' },
  { nombre: 'Azúcar', unidad: 'bolsas de 1 kg (o endulzante líquido)', cantidadIdeal: 2, icono: '🍬' },
  { nombre: 'Sal fina', unidad: 'bolsa de 1 kg', cantidadIdeal: 1, icono: '🧂' },
  { nombre: 'Orégano', unidad: 'sobre', cantidadIdeal: 1, icono: '🌿' },
  { nombre: 'Comino', unidad: 'sobre', cantidadIdeal: 1, icono: '🌿' },
  { nombre: 'Pimienta molida', unidad: 'frasco pequeño', cantidadIdeal: 1, icono: '🌿' },
  { nombre: 'Mermelada', unidad: 'frasco grande (frutilla o durazno)', cantidadIdeal: 1, icono: '🍯' },
  { nombre: 'Manjar', unidad: 'pote de 500 g', cantidadIdeal: 1, icono: '🍯' },

  // Limpieza del Hogar e Higiene Personal
  { nombre: 'Detergente líquido', unidad: 'bidón de 3 litros', cantidadIdeal: 1, icono: '🧴' },
  { nombre: 'Suavizante de ropa', unidad: 'botella grande', cantidadIdeal: 1, icono: '🧴' },
  { nombre: 'Lavalozas', unidad: 'botellas de 750 cc', cantidadIdeal: 2, icono: '🧴' },
  { nombre: 'Esponjas de cocina', unidad: 'pack de 3 unidades', cantidadIdeal: 1, icono: '🧽' },
  { nombre: 'Cloro corriente', unidad: 'botellas de 1 litro', cantidadIdeal: 2, icono: '🧴' },
  { nombre: 'Limpiador de pisos', unidad: 'botella grande', cantidadIdeal: 1, icono: '🧴' },
  { nombre: 'Limpiador multiuso', unidad: 'botella en spray', cantidadIdeal: 1, icono: '🧴' },
  { nombre: 'Papel higiénico', unidad: 'pack de 24 rollos (doble hoja)', cantidadIdeal: 1, icono: '🧻' },
  { nombre: 'Toalla de papel', unidad: 'pack de 3 rollos grandes', cantidadIdeal: 1, icono: '🧻' },
  { nombre: 'Jabón', unidad: 'barras (o 2 repuestos líquidos)', cantidadIdeal: 4, icono: '🧼' },
  { nombre: 'Champú', unidad: 'botella familiar de 1 litro', cantidadIdeal: 1, icono: '🧴' },
  { nombre: 'Acondicionador', unidad: 'botella grande', cantidadIdeal: 1, icono: '🧴' },
  { nombre: 'Pasta de dientes', unidad: 'tubos grandes', cantidadIdeal: 3, icono: '🪥' },
];
