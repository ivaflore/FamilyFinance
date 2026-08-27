# Functional Design (condensado) — Unidad 4: Hogar

## Entidades

- **ProductoAlacena**: `id`, `grupoFamiliarId`, `icono`, `nombre`, `cantidadTexto`, `porAgotarse`.
- **ItemCompra**: `id`, `grupoFamiliarId`, `nombre`, `precioEstimado`, `comprado`.
- **Receta**: `id`, `grupoFamiliarId`, `nombre`, `tipos` (array: almuerzo/cena/desayuno), `tiempoMin`, `porciones`, `ingredientes` (array), `pasos` (array).
- **PlanificacionDia**: `id`, `grupoFamiliarId`, `fecha`, `tipoComida`, `recetaId`.

## Reglas de Negocio

- **BR-18**: `marcarItemComprado` es idempotente — marcarlo dos veces seguidas dado el mismo `itemId` no cambia el resultado observable después de la primera vez.
- **BR-19**: `generarListaDesdeMenu` nunca duplica ítems ya presentes en `ItemCompra` (comparación por nombre normalizado — mismo criterio ya validado en el prototipo original).
- **BR-20**: una `Receta` pertenece a un único grupo — no hay recetario global compartido entre grupos en este ciclo (consistente con RF-07/US-15, sin la opción "comunidad pública" descartada en Requirements Analysis).

## Flujos Clave

1. **Alacena**: agregar/listar productos del grupo; alerta visual si `porAgotarse=true`.
2. **Lista de compras**: agregar ítem, marcar comprado (idempotente, BR-18).
3. **Generar lista desde menú**: lee `PlanificacionDia` + `Receta` del grupo, agrega a `ItemCompra` solo los ingredientes que faltan (BR-19).
4. **Recetario**: agregar/listar recetas del grupo, filtrables por tipo/rapidez.
5. **Calendario**: planificar una receta en un día+tipo de comida; listar el mes.

## Propiedades Testeables (PBT-01)

| ID | Categoría | Propiedad |
|---|---|---|
| PROP-14 | Idempotencia | `marcarItemComprado(itemId)` aplicado dos veces seguidas produce el mismo estado que aplicarlo una vez (BR-18). |
| PROP-15 | Idempotencia | `generarListaDesdeMenu` ejecutado dos veces seguidas sobre el mismo menú produce el mismo conjunto final de `ItemCompra` que ejecutarlo una vez (BR-19, no duplica). |
| PROP-16 | Invariante (multi-tenant) | La alacena, la lista de compras, el recetario y el calendario de un grupo nunca exponen filas de otro grupo (extensión de PROP-08). |
