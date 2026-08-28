-- Agrega categoria a ProductoAlacena para poder agrupar el inventario en
-- la UI (Despensa y Abarrotes, Proteinas y Congelados, etc.) en vez de
-- mostrarlo como una sola lista plana.
ALTER TABLE "ProductoAlacena" ADD COLUMN "categoria" TEXT NOT NULL DEFAULT 'Otros';

-- Reclasifica los productos ya existentes que coinciden por nombre con el
-- catalogo de despensa base (backend/src/hogar/despensa-base.ts), para que
-- los grupos que ya importaron esa lista vean sus productos agrupados
-- correctamente sin tener que editarlos uno por uno. Los productos que el
-- usuario agrego a mano con otro nombre quedan en 'Otros' (el default) y
-- pueden reclasificarse editando el producto.
UPDATE "ProductoAlacena" SET "categoria" = 'Despensa y Abarrotes' WHERE lower(nombre) IN (lower('Arroz'), lower('Tallarines'), lower('Espirales / Corbatitas'), lower('Lentejas'), lower('Porotos (granados o negros)'), lower('Harina'), lower('Aceite vegetal'), lower('Salsa de tomate'), lower('Atún en conserva'), lower('Jurel en conserva'), lower('Puré de papas'), lower('Avena instantánea'), lower('Caldo concentrado'), lower('Sopas en sobre'));

UPDATE "ProductoAlacena" SET "categoria" = 'Proteínas y Congelados' WHERE lower(nombre) IN (lower('Pechuga de pollo'), lower('Trutro de pollo'), lower('Carne molida'), lower('Carne vacuna para guiso'), lower('Pulpa de cerdo'), lower('Pescado congelado'), lower('Vienesas'), lower('Longanizas / Chorizos'));

UPDATE "ProductoAlacena" SET "categoria" = 'Lácteos, Huevos y Fiambrería' WHERE lower(nombre) IN (lower('Huevos'), lower('Leche entera / descremada'), lower('Queso laminado'), lower('Jamón'), lower('Mantequilla'), lower('Yogurt'), lower('Pan de molde'));

UPDATE "ProductoAlacena" SET "categoria" = 'Frutas y Verduras' WHERE lower(nombre) IN (lower('Papas'), lower('Cebollas'), lower('Zanahorias'), lower('Ajo'), lower('Tomates'), lower('Limones'), lower('Lechuga'), lower('Apio'), lower('Primavera de verduras congelada'), lower('Manzanas'), lower('Naranjas'), lower('Plátanos'));

UPDATE "ProductoAlacena" SET "categoria" = 'Desayuno, Especias y Dulces' WHERE lower(nombre) IN (lower('Té'), lower('Café instantáneo'), lower('Azúcar'), lower('Sal fina'), lower('Orégano'), lower('Comino'), lower('Pimienta molida'), lower('Mermelada'), lower('Manjar'));

UPDATE "ProductoAlacena" SET "categoria" = 'Limpieza e Higiene' WHERE lower(nombre) IN (lower('Detergente líquido'), lower('Suavizante de ropa'), lower('Lavalozas'), lower('Esponjas de cocina'), lower('Cloro corriente'), lower('Limpiador de pisos'), lower('Limpiador multiuso'), lower('Papel higiénico'), lower('Toalla de papel'), lower('Jabón'), lower('Champú'), lower('Acondicionador'), lower('Pasta de dientes'));

