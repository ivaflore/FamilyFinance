-- Agrega precioEstimado a ProductoAlacena para poder estimar el gasto de
-- una compra antes de hacerla (se usa en la lista de compras junto a la
-- cantidad propuesta a comprar).
ALTER TABLE "ProductoAlacena" ADD COLUMN "precioEstimado" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Rellena un precio de referencia para los productos ya existentes que
-- coinciden por nombre con el catalogo de despensa base
-- (backend/src/hogar/despensa-base.ts). Son valores referenciales, no
-- precios reales de ningun supermercado -- el usuario puede corregirlos
-- editando el producto. El guard "precioEstimado" = 0 evita pisar un valor
-- que el usuario ya haya cargado a mano.
UPDATE "ProductoAlacena" SET "precioEstimado" = 1200 WHERE lower(nombre) = lower('Arroz') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1000 WHERE lower(nombre) = lower('Tallarines') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1000 WHERE lower(nombre) = lower('Espirales / Corbatitas') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1800 WHERE lower(nombre) = lower('Lentejas') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 2200 WHERE lower(nombre) = lower('Porotos (granados o negros)') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 900 WHERE lower(nombre) = lower('Harina') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 3200 WHERE lower(nombre) = lower('Aceite vegetal') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 700 WHERE lower(nombre) = lower('Salsa de tomate') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1500 WHERE lower(nombre) = lower('Atún en conserva') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1300 WHERE lower(nombre) = lower('Jurel en conserva') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 2500 WHERE lower(nombre) = lower('Puré de papas') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1600 WHERE lower(nombre) = lower('Avena instantánea') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1800 WHERE lower(nombre) = lower('Caldo concentrado') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 600 WHERE lower(nombre) = lower('Sopas en sobre') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 9000 WHERE lower(nombre) = lower('Pechuga de pollo') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 3500 WHERE lower(nombre) = lower('Trutro de pollo') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 7000 WHERE lower(nombre) = lower('Carne molida') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 8500 WHERE lower(nombre) = lower('Carne vacuna para guiso') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 6500 WHERE lower(nombre) = lower('Pulpa de cerdo') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 5000 WHERE lower(nombre) = lower('Pescado congelado') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 2800 WHERE lower(nombre) = lower('Vienesas') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 3500 WHERE lower(nombre) = lower('Longanizas / Chorizos') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 4500 WHERE lower(nombre) = lower('Huevos') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 10800 WHERE lower(nombre) = lower('Leche entera / descremada') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 5500 WHERE lower(nombre) = lower('Queso laminado') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 3200 WHERE lower(nombre) = lower('Jamón') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 2200 WHERE lower(nombre) = lower('Mantequilla') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 4000 WHERE lower(nombre) = lower('Yogurt') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 2200 WHERE lower(nombre) = lower('Pan de molde') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 6000 WHERE lower(nombre) = lower('Papas') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 2500 WHERE lower(nombre) = lower('Cebollas') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1800 WHERE lower(nombre) = lower('Zanahorias') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 2000 WHERE lower(nombre) = lower('Ajo') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1800 WHERE lower(nombre) = lower('Tomates') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1500 WHERE lower(nombre) = lower('Limones') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 900 WHERE lower(nombre) = lower('Lechuga') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1000 WHERE lower(nombre) = lower('Apio') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 2200 WHERE lower(nombre) = lower('Primavera de verduras congelada') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1600 WHERE lower(nombre) = lower('Manzanas') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1400 WHERE lower(nombre) = lower('Naranjas') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 3000 WHERE lower(nombre) = lower('Plátanos') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 3500 WHERE lower(nombre) = lower('Té') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 4500 WHERE lower(nombre) = lower('Café instantáneo') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1300 WHERE lower(nombre) = lower('Azúcar') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 600 WHERE lower(nombre) = lower('Sal fina') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 800 WHERE lower(nombre) = lower('Orégano') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 800 WHERE lower(nombre) = lower('Comino') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1500 WHERE lower(nombre) = lower('Pimienta molida') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 2500 WHERE lower(nombre) = lower('Mermelada') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 2200 WHERE lower(nombre) = lower('Manjar') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 6500 WHERE lower(nombre) = lower('Detergente líquido') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 3500 WHERE lower(nombre) = lower('Suavizante de ropa') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1800 WHERE lower(nombre) = lower('Lavalozas') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 1200 WHERE lower(nombre) = lower('Esponjas de cocina') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 900 WHERE lower(nombre) = lower('Cloro corriente') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 2500 WHERE lower(nombre) = lower('Limpiador de pisos') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 2200 WHERE lower(nombre) = lower('Limpiador multiuso') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 8500 WHERE lower(nombre) = lower('Papel higiénico') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 3500 WHERE lower(nombre) = lower('Toalla de papel') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 700 WHERE lower(nombre) = lower('Jabón') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 4500 WHERE lower(nombre) = lower('Champú') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 4500 WHERE lower(nombre) = lower('Acondicionador') AND "precioEstimado" = 0;
UPDATE "ProductoAlacena" SET "precioEstimado" = 2200 WHERE lower(nombre) = lower('Pasta de dientes') AND "precioEstimado" = 0;
