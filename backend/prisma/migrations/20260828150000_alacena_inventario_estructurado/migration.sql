-- Reestructura ProductoAlacena para soportar inventario real:
-- cantidadIdeal (lo que deberíamos tener) vs cantidadActual (lo que tenemos).
-- La lista de compras se deriva de la diferencia entre ambas (ver hogar.logic.ts).

-- 1. Agrega las columnas nuevas con valores por defecto neutros.
ALTER TABLE "ProductoAlacena" ADD COLUMN "unidad" TEXT NOT NULL DEFAULT 'unidades';
ALTER TABLE "ProductoAlacena" ADD COLUMN "cantidadIdeal" DECIMAL(10,2) NOT NULL DEFAULT 1;
ALTER TABLE "ProductoAlacena" ADD COLUMN "cantidadActual" DECIMAL(10,2) NOT NULL DEFAULT 1;

-- 2. Migra los datos existentes preservando su semántica: los productos que
-- ya estaban marcados "por agotarse" quedan con cantidadActual = 0 (bajo el
-- ideal, por lo tanto aparecen de inmediato como sugeridos para comprar);
-- el resto queda con cantidadActual = cantidadIdeal (abastecido, sin sugerir compra).
-- El texto libre de cantidadTexto no es convertible a un número de forma
-- confiable, así que se pierde en la migración — los usuarios deberán
-- reingresar la cantidad exacta de sus productos existentes.
UPDATE "ProductoAlacena" SET "cantidadActual" = 0 WHERE "porAgotarse" = true;

-- 3. Elimina las columnas viejas, ya reemplazadas.
ALTER TABLE "ProductoAlacena" DROP COLUMN "cantidadTexto";
ALTER TABLE "ProductoAlacena" DROP COLUMN "porAgotarse";
