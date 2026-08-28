// Catálogo estático de referencia: una despensa base típica de un hogar
// chileno, con cantidades ideales y precios estimados (CLP, referenciales —
// sirven para estimar el gasto de la compra, no son precios reales de
// ningún supermercado). No requiere tabla en base de datos (a diferencia de
// RecetaPlantilla) porque no se prevé que cambie con frecuencia — se sirve
// tal cual vía /despensa-base y cada grupo puede importarla a su propia
// alacena con un clic (hogarService.importarDespensaBase).

// Debe reflejar exactamente las categorías que ofrece el selector del
// frontend (frontend/src/panels/hogar.ts) para agrupar el inventario.
export const CATEGORIAS_ALACENA = [
  'Despensa y Abarrotes',
  'Proteínas y Congelados',
  'Lácteos, Huevos y Fiambrería',
  'Frutas y Verduras',
  'Desayuno, Especias y Dulces',
  'Limpieza e Higiene',
  'Otros',
];

export interface ProductoDespensaBase {
  nombre: string;
  unidad: string;
  cantidadIdeal: number;
  icono: string;
  categoria: string;
  precioEstimado: number;
}

export const DESPENSA_BASE: ProductoDespensaBase[] = [
  // Despensa y Abarrotes
  { nombre: 'Arroz', unidad: 'bolsas de 1 kg (grano largo ancho)', cantidadIdeal: 5, icono: '🍚', categoria: 'Despensa y Abarrotes', precioEstimado: 1200 },
  { nombre: 'Tallarines', unidad: 'paquetes de 400-500 g', cantidadIdeal: 4, icono: '🍝', categoria: 'Despensa y Abarrotes', precioEstimado: 1000 },
  { nombre: 'Espirales / Corbatitas', unidad: 'paquetes de 400-500 g', cantidadIdeal: 6, icono: '🍝', categoria: 'Despensa y Abarrotes', precioEstimado: 1000 },
  { nombre: 'Lentejas', unidad: 'bolsas de 1 kg', cantidadIdeal: 2, icono: '🫘', categoria: 'Despensa y Abarrotes', precioEstimado: 1800 },
  { nombre: 'Porotos (granados o negros)', unidad: 'bolsa de 1 kg', cantidadIdeal: 1, icono: '🫘', categoria: 'Despensa y Abarrotes', precioEstimado: 2200 },
  { nombre: 'Harina', unidad: 'bolsas de 1 kg (sin polvos de hornear)', cantidadIdeal: 2, icono: '🌾', categoria: 'Despensa y Abarrotes', precioEstimado: 900 },
  { nombre: 'Aceite vegetal', unidad: 'botellas de 1 litro', cantidadIdeal: 4, icono: '🫗', categoria: 'Despensa y Abarrotes', precioEstimado: 3200 },
  { nombre: 'Salsa de tomate', unidad: 'cajitas de 200 g', cantidadIdeal: 10, icono: '🍅', categoria: 'Despensa y Abarrotes', precioEstimado: 700 },
  { nombre: 'Atún en conserva', unidad: 'latas (en agua o aceite)', cantidadIdeal: 6, icono: '🐟', categoria: 'Despensa y Abarrotes', precioEstimado: 1500 },
  { nombre: 'Jurel en conserva', unidad: 'tarros grandes', cantidadIdeal: 3, icono: '🐟', categoria: 'Despensa y Abarrotes', precioEstimado: 1300 },
  { nombre: 'Puré de papas', unidad: 'cajas familiares', cantidadIdeal: 2, icono: '🥔', categoria: 'Despensa y Abarrotes', precioEstimado: 2500 },
  { nombre: 'Avena instantánea', unidad: 'bolsa de 1 kg', cantidadIdeal: 1, icono: '🥣', categoria: 'Despensa y Abarrotes', precioEstimado: 1600 },
  { nombre: 'Caldo concentrado', unidad: 'pack de 12 tabletas (carne/pollo)', cantidadIdeal: 1, icono: '🧂', categoria: 'Despensa y Abarrotes', precioEstimado: 1800 },
  { nombre: 'Sopas en sobre', unidad: 'unidades variadas', cantidadIdeal: 4, icono: '🥫', categoria: 'Despensa y Abarrotes', precioEstimado: 600 },

  // Proteínas y Congelados
  { nombre: 'Pechuga de pollo', unidad: 'bandejas deshuesadas (~2 kg total)', cantidadIdeal: 2, icono: '🍗', categoria: 'Proteínas y Congelados', precioEstimado: 9000 },
  { nombre: 'Trutro de pollo', unidad: 'kg (entero o cuarto)', cantidadIdeal: 3, icono: '🍗', categoria: 'Proteínas y Congelados', precioEstimado: 3500 },
  { nombre: 'Carne molida', unidad: 'kg (baja en grasa)', cantidadIdeal: 2, icono: '🥩', categoria: 'Proteínas y Congelados', precioEstimado: 7000 },
  { nombre: 'Carne vacuna para guiso', unidad: 'kg (posta negra, rosada o asiento)', cantidadIdeal: 2, icono: '🥩', categoria: 'Proteínas y Congelados', precioEstimado: 8500 },
  { nombre: 'Pulpa de cerdo', unidad: 'kg (en cubos o chuletas)', cantidadIdeal: 1.5, icono: '🥩', categoria: 'Proteínas y Congelados', precioEstimado: 6500 },
  { nombre: 'Pescado congelado', unidad: 'bolsas de 1 kg (merluza o reineta)', cantidadIdeal: 2, icono: '🐟', categoria: 'Proteínas y Congelados', precioEstimado: 5000 },
  { nombre: 'Vienesas', unidad: 'paquetes grandes (tradicional o pavo)', cantidadIdeal: 2, icono: '🌭', categoria: 'Proteínas y Congelados', precioEstimado: 2800 },
  { nombre: 'Longanizas / Chorizos', unidad: 'paquete', cantidadIdeal: 1, icono: '🌭', categoria: 'Proteínas y Congelados', precioEstimado: 3500 },

  // Lácteos, Huevos y Fiambrería
  { nombre: 'Huevos', unidad: 'bandejas de 30 unidades (60 en total)', cantidadIdeal: 2, icono: '🥚', categoria: 'Lácteos, Huevos y Fiambrería', precioEstimado: 4500 },
  { nombre: 'Leche entera / descremada', unidad: 'cajas de 12 litros (24 litros total)', cantidadIdeal: 2, icono: '🥛', categoria: 'Lácteos, Huevos y Fiambrería', precioEstimado: 10800 },
  { nombre: 'Queso laminado', unidad: 'envases familiares de 500 g (gauda o mantecoso)', cantidadIdeal: 3, icono: '🧀', categoria: 'Lácteos, Huevos y Fiambrería', precioEstimado: 5500 },
  { nombre: 'Jamón', unidad: 'envases de 250 g (pierna o pavo)', cantidadIdeal: 4, icono: '🍖', categoria: 'Lácteos, Huevos y Fiambrería', precioEstimado: 3200 },
  { nombre: 'Mantequilla', unidad: 'panes de 250 g', cantidadIdeal: 4, icono: '🧈', categoria: 'Lácteos, Huevos y Fiambrería', precioEstimado: 2200 },
  { nombre: 'Yogurt', unidad: 'packs de 8 unidades', cantidadIdeal: 4, icono: '🥛', categoria: 'Lácteos, Huevos y Fiambrería', precioEstimado: 4000 },
  { nombre: 'Pan de molde', unidad: 'bolsas grandes', cantidadIdeal: 4, icono: '🍞', categoria: 'Lácteos, Huevos y Fiambrería', precioEstimado: 2200 },

  // Frutas y Verduras (base de guarda)
  { nombre: 'Papas', unidad: 'malla de 10 kg', cantidadIdeal: 1, icono: '🥔', categoria: 'Frutas y Verduras', precioEstimado: 6000 },
  { nombre: 'Cebollas', unidad: 'malla de 3 kg', cantidadIdeal: 1, icono: '🧅', categoria: 'Frutas y Verduras', precioEstimado: 2500 },
  { nombre: 'Zanahorias', unidad: 'bolsa de 2 kg', cantidadIdeal: 1, icono: '🥕', categoria: 'Frutas y Verduras', precioEstimado: 1800 },
  { nombre: 'Ajo', unidad: 'malla de 5-6 cabezas', cantidadIdeal: 1, icono: '🧄', categoria: 'Frutas y Verduras', precioEstimado: 2000 },
  { nombre: 'Tomates', unidad: 'kg', cantidadIdeal: 4, icono: '🍅', categoria: 'Frutas y Verduras', precioEstimado: 1800 },
  { nombre: 'Limones', unidad: 'kg', cantidadIdeal: 1, icono: '🍋', categoria: 'Frutas y Verduras', precioEstimado: 1500 },
  { nombre: 'Lechuga', unidad: 'plantas', cantidadIdeal: 2, icono: '🥬', categoria: 'Frutas y Verduras', precioEstimado: 900 },
  { nombre: 'Apio', unidad: 'mata grande', cantidadIdeal: 1, icono: '🥬', categoria: 'Frutas y Verduras', precioEstimado: 1000 },
  { nombre: 'Primavera de verduras congelada', unidad: 'bolsas de 1 kg', cantidadIdeal: 2, icono: '🥦', categoria: 'Frutas y Verduras', precioEstimado: 2200 },
  { nombre: 'Manzanas', unidad: 'kg', cantidadIdeal: 4, icono: '🍎', categoria: 'Frutas y Verduras', precioEstimado: 1600 },
  { nombre: 'Naranjas', unidad: 'kg', cantidadIdeal: 3, icono: '🍊', categoria: 'Frutas y Verduras', precioEstimado: 1400 },
  { nombre: 'Plátanos', unidad: 'compra quincenal', cantidadIdeal: 1, icono: '🍌', categoria: 'Frutas y Verduras', precioEstimado: 3000 },

  // Desayuno, Especias y Dulces
  { nombre: 'Té', unidad: 'caja de 100 bolsitas', cantidadIdeal: 1, icono: '🍵', categoria: 'Desayuno, Especias y Dulces', precioEstimado: 3500 },
  { nombre: 'Café instantáneo', unidad: 'tarro/bolsa de 170 g', cantidadIdeal: 1, icono: '☕', categoria: 'Desayuno, Especias y Dulces', precioEstimado: 4500 },
  { nombre: 'Azúcar', unidad: 'bolsas de 1 kg (o endulzante líquido)', cantidadIdeal: 2, icono: '🍬', categoria: 'Desayuno, Especias y Dulces', precioEstimado: 1300 },
  { nombre: 'Sal fina', unidad: 'bolsa de 1 kg', cantidadIdeal: 1, icono: '🧂', categoria: 'Desayuno, Especias y Dulces', precioEstimado: 600 },
  { nombre: 'Orégano', unidad: 'sobre', cantidadIdeal: 1, icono: '🌿', categoria: 'Desayuno, Especias y Dulces', precioEstimado: 800 },
  { nombre: 'Comino', unidad: 'sobre', cantidadIdeal: 1, icono: '🌿', categoria: 'Desayuno, Especias y Dulces', precioEstimado: 800 },
  { nombre: 'Pimienta molida', unidad: 'frasco pequeño', cantidadIdeal: 1, icono: '🌿', categoria: 'Desayuno, Especias y Dulces', precioEstimado: 1500 },
  { nombre: 'Mermelada', unidad: 'frasco grande (frutilla o durazno)', cantidadIdeal: 1, icono: '🍯', categoria: 'Desayuno, Especias y Dulces', precioEstimado: 2500 },
  { nombre: 'Manjar', unidad: 'pote de 500 g', cantidadIdeal: 1, icono: '🍯', categoria: 'Desayuno, Especias y Dulces', precioEstimado: 2200 },

  // Limpieza del Hogar e Higiene Personal
  { nombre: 'Detergente líquido', unidad: 'bidón de 3 litros', cantidadIdeal: 1, icono: '🧴', categoria: 'Limpieza e Higiene', precioEstimado: 6500 },
  { nombre: 'Suavizante de ropa', unidad: 'botella grande', cantidadIdeal: 1, icono: '🧴', categoria: 'Limpieza e Higiene', precioEstimado: 3500 },
  { nombre: 'Lavalozas', unidad: 'botellas de 750 cc', cantidadIdeal: 2, icono: '🧴', categoria: 'Limpieza e Higiene', precioEstimado: 1800 },
  { nombre: 'Esponjas de cocina', unidad: 'pack de 3 unidades', cantidadIdeal: 1, icono: '🧽', categoria: 'Limpieza e Higiene', precioEstimado: 1200 },
  { nombre: 'Cloro corriente', unidad: 'botellas de 1 litro', cantidadIdeal: 2, icono: '🧴', categoria: 'Limpieza e Higiene', precioEstimado: 900 },
  { nombre: 'Limpiador de pisos', unidad: 'botella grande', cantidadIdeal: 1, icono: '🧴', categoria: 'Limpieza e Higiene', precioEstimado: 2500 },
  { nombre: 'Limpiador multiuso', unidad: 'botella en spray', cantidadIdeal: 1, icono: '🧴', categoria: 'Limpieza e Higiene', precioEstimado: 2200 },
  { nombre: 'Papel higiénico', unidad: 'pack de 24 rollos (doble hoja)', cantidadIdeal: 1, icono: '🧻', categoria: 'Limpieza e Higiene', precioEstimado: 8500 },
  { nombre: 'Toalla de papel', unidad: 'pack de 3 rollos grandes', cantidadIdeal: 1, icono: '🧻', categoria: 'Limpieza e Higiene', precioEstimado: 3500 },
  { nombre: 'Jabón', unidad: 'barras (o 2 repuestos líquidos)', cantidadIdeal: 4, icono: '🧼', categoria: 'Limpieza e Higiene', precioEstimado: 700 },
  { nombre: 'Champú', unidad: 'botella familiar de 1 litro', cantidadIdeal: 1, icono: '🧴', categoria: 'Limpieza e Higiene', precioEstimado: 4500 },
  { nombre: 'Acondicionador', unidad: 'botella grande', cantidadIdeal: 1, icono: '🧴', categoria: 'Limpieza e Higiene', precioEstimado: 4500 },
  { nombre: 'Pasta de dientes', unidad: 'tubos grandes', cantidadIdeal: 3, icono: '🪥', categoria: 'Limpieza e Higiene', precioEstimado: 2200 },
];
