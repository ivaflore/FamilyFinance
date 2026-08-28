-- CreateTable: catálogo compartido de recetas sugeridas (sin grupoFamiliarId,
-- es contenido de referencia de solo lectura, no dato de un tenant).
CREATE TABLE "RecetaPlantilla" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipos" TEXT[],
    "tiempoMin" INTEGER NOT NULL,
    "porciones" INTEGER NOT NULL,
    "ingredientes" JSONB NOT NULL,
    "pasos" TEXT[],

    CONSTRAINT "RecetaPlantilla_pkey" PRIMARY KEY ("id")
);

-- Siembra el catálogo inicial con 10 recetas comunes.
INSERT INTO "RecetaPlantilla" (id, nombre, tipos, "tiempoMin", porciones, ingredientes, pasos) VALUES
('b742a3e4-4e8c-4025-a956-0c70e2a3857b', 'Arroz con pollo', ARRAY['almuerzo'], 45, 4,
  '[{"n":"Arroz","cat":"abarrotes"},{"n":"Pechuga de pollo","cat":"proteinas"},{"n":"Cebolla","cat":"verduras"},{"n":"Pimentón","cat":"verduras"},{"n":"Zanahoria","cat":"verduras"},{"n":"Caldo de ave","cat":"abarrotes"}]'::jsonb,
  ARRAY['Sofreír la cebolla, el pimentón y la zanahoria', 'Agregar el pollo troceado y dorar', 'Incorporar el arroz y el caldo', 'Cocinar tapado a fuego bajo 20 minutos']),
('556fde97-62ea-47f9-bbcd-a1107fcf46e3', 'Porotos granados', ARRAY['almuerzo'], 60, 4,
  '[{"n":"Porotos","cat":"abarrotes"},{"n":"Choclo","cat":"verduras"},{"n":"Zapallo","cat":"verduras"},{"n":"Cebolla","cat":"verduras"},{"n":"Albahaca","cat":"verduras"}]'::jsonb,
  ARRAY['Sofreír la cebolla con albahaca', 'Agregar los porotos remojados y cubrir con agua', 'Cocinar 40 minutos', 'Añadir el choclo y el zapallo, cocinar 15 minutos más']),
('459702fd-5f5f-4d70-87d9-1ef0714c4ddb', 'Ensalada César', ARRAY['almuerzo', 'cena'], 20, 4,
  '[{"n":"Lechuga","cat":"verduras"},{"n":"Pechuga de pollo","cat":"proteinas"},{"n":"Pan de molde","cat":"abarrotes"},{"n":"Queso parmesano","cat":"lacteos"},{"n":"Aderezo césar","cat":"abarrotes"}]'::jsonb,
  ARRAY['Cocinar y trozar la pechuga de pollo', 'Tostar el pan y cortar en cubos para los croutons', 'Mezclar la lechuga con el aderezo', 'Agregar el pollo, los croutons y el parmesano']),
('e619365a-1a5d-4a8b-9065-1412e00e9445', 'Pasta napolitana', ARRAY['almuerzo', 'cena'], 30, 4,
  '[{"n":"Pasta","cat":"abarrotes"},{"n":"Tomate","cat":"verduras"},{"n":"Ajo","cat":"verduras"},{"n":"Cebolla","cat":"verduras"},{"n":"Queso rallado","cat":"lacteos"}]'::jsonb,
  ARRAY['Cocinar la pasta en agua con sal', 'Sofreír el ajo y la cebolla', 'Agregar el tomate y cocinar la salsa 15 minutos', 'Mezclar con la pasta y espolvorear queso']),
('e7b5c79d-9a2e-4fd0-af5b-b8b914450e50', 'Tacos de carne', ARRAY['cena'], 25, 4,
  '[{"n":"Tortillas","cat":"abarrotes"},{"n":"Carne molida","cat":"proteinas"},{"n":"Cebolla","cat":"verduras"},{"n":"Tomate","cat":"verduras"},{"n":"Cilantro","cat":"verduras"},{"n":"Palta","cat":"verduras"}]'::jsonb,
  ARRAY['Dorar la carne molida con cebolla', 'Picar el tomate, el cilantro y la palta', 'Calentar las tortillas', 'Armar los tacos con todos los ingredientes']),
('d9eb5ac9-3e7b-4bd6-ac13-8f7c480f1d39', 'Sopaipillas', ARRAY['desayuno'], 30, 4,
  '[{"n":"Zapallo","cat":"verduras"},{"n":"Harina","cat":"abarrotes"},{"n":"Aceite","cat":"abarrotes"}]'::jsonb,
  ARRAY['Cocinar y hacer puré el zapallo', 'Mezclar con harina hasta formar una masa', 'Estirar y cortar discos', 'Freír en aceite caliente hasta dorar']),
('995b9d95-ecfe-4394-a30b-9ed11bd0b262', 'Salmón al horno con verduras', ARRAY['almuerzo', 'cena'], 35, 4,
  '[{"n":"Salmón","cat":"proteinas"},{"n":"Papas","cat":"verduras"},{"n":"Brócoli","cat":"verduras"},{"n":"Limón","cat":"verduras"},{"n":"Aceite de oliva","cat":"abarrotes"}]'::jsonb,
  ARRAY['Precalentar el horno a 200°C', 'Disponer el salmón y las verduras en una bandeja', 'Rociar con aceite de oliva y limón', 'Hornear 20-25 minutos']),
('b19c48b3-2b1c-43f6-a973-4660a2e8f6bf', 'Lentejas guisadas', ARRAY['almuerzo'], 40, 4,
  '[{"n":"Lentejas","cat":"abarrotes"},{"n":"Zanahoria","cat":"verduras"},{"n":"Cebolla","cat":"verduras"},{"n":"Tomate","cat":"verduras"},{"n":"Chorizo","cat":"proteinas"}]'::jsonb,
  ARRAY['Sofreír la cebolla, la zanahoria y el chorizo', 'Agregar el tomate picado', 'Incorporar las lentejas y cubrir con agua', 'Cocinar 30 minutos a fuego medio']),
('df493fff-6751-473b-bd75-ceafebada52c', 'Omelette de verduras', ARRAY['desayuno'], 15, 2,
  '[{"n":"Huevos","cat":"proteinas"},{"n":"Espinaca","cat":"verduras"},{"n":"Champiñones","cat":"verduras"},{"n":"Queso","cat":"lacteos"}]'::jsonb,
  ARRAY['Batir los huevos', 'Saltear la espinaca y los champiñones', 'Verter los huevos sobre las verduras', 'Agregar queso y doblar el omelette']),
('f7ef3bed-1f35-4543-adf2-0ce6a1eefb53', 'Cazuela de vacuno', ARRAY['almuerzo'], 70, 4,
  '[{"n":"Posta de vacuno","cat":"proteinas"},{"n":"Papas","cat":"verduras"},{"n":"Zapallo","cat":"verduras"},{"n":"Choclo","cat":"verduras"},{"n":"Zanahoria","cat":"verduras"},{"n":"Arroz","cat":"abarrotes"}]'::jsonb,
  ARRAY['Cocinar la carne en agua hasta que esté tierna', 'Agregar las papas, el zapallo y la zanahoria', 'Incorporar el choclo y cocinar 20 minutos', 'Servir con arroz aparte']);
