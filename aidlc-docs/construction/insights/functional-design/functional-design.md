# Functional Design (condensado) — Unidad 5: Insights

## Entidades

- **ProductoSegmentado**: `id`, `grupoFamiliarId`, `nombre`, `categoria`, `frecuencia`, `precioUnitario`, `cantidad`, `total` (derivado: `precioUnitario * cantidad`), `segmento` (`cat1`|`cat2`|`saving`), `justificacion`.

## Reglas de Negocio

- **BR-21**: `consultarAsistente` solo lee datos (`Gasto`, `Presupuesto`, `ProductoAlacena`, `ProductoSegmentado`) del `grupoFamiliarId` del solicitante, resuelto por el middleware — nunca de otro grupo (BR-13/SECURITY-08).
- **BR-22**: el asistente es lógica local basada en reglas (coincidencia de palabras clave contra los datos reales del grupo), **sin llamadas a servicios de IA externos** — mismo criterio ya corregido en el prototipo (ver `code-quality-assessment.md`, hallazgo remediado).

## Flujos Clave

1. **Clasificar producto**: asigna/actualiza el `segmento` de un `ProductoSegmentado` del grupo.
2. **Resumen de segmentación**: totales y ahorro potencial agrupados por `segmento`.
3. **Consultar asistente**: según palabras clave del texto, compone una respuesta combinando lecturas de Núcleo Financiero y Hogar del mismo grupo (BR-21).

## Propiedades Testeables (PBT-01)

| ID | Categoría | Propiedad |
|---|---|---|
| PROP-17 | Invariante (multi-tenant) | Para dos grupos A≠B con datos generados aleatoriamente, la respuesta del asistente para A nunca contiene montos, nombres de producto o datos provenientes de B (extensión de PROP-08 al asistente). |
| PROP-18 | Invariante | El resumen de segmentación de un grupo, para cualquier conjunto de productos generado, cumple `total(cat1) + total(cat2) + total(saving) == SUM(total de todos los productos del grupo)`. |
