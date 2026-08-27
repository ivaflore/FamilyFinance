# Functional Design (condensado) — Unidad 3: Núcleo Financiero

## Entidades

- **Gasto**: `id`, `grupoFamiliarId`, `usuarioId`, `descripcion`, `monto`, `categoria`, `fecha`.
- **Presupuesto**: `id`, `grupoFamiliarId`, `categoria` (único por grupo+categoría), `montoAsignado`.

## Reglas de Negocio

- **BR-14**: `monto` de un `Gasto` debe ser un número positivo (SECURITY-05).
- **BR-15**: el "gastado" de una categoría **nunca se guarda como contador separado** — siempre se calcula como `SUM(monto)` de los `Gasto` de esa categoría en el momento de la consulta. Elimina el riesgo de desincronización que existía en el prototipo original (donde `budgets[cat].spent` podía desalinearse del historial real).
- **BR-16**: `obtenerAportePorMiembro` se deriva siempre como `SUM(monto)`/`COUNT(*)` agrupado por `usuarioId`, nunca como un contador mantenido aparte.
- **BR-17**: `definirPresupuesto` requiere rol Administrador (BR-09 de Grupos Familiares, reutilizada aquí).

## Flujos Clave

1. **Registrar gasto** → inserta `Gasto`; el presupuesto de la categoría se refleja automáticamente en la siguiente lectura (BR-15), sin paso de "actualización" separado que pueda desincronizarse.
2. **Definir presupuesto** → upsert de `Presupuesto` por `(grupoFamiliarId, categoria)`.
3. **Obtener estado de presupuesto** → por categoría, `montoAsignado` vs. `SUM(gastos)` calculado en la consulta.
4. **Obtener aporte por miembro** → agregación sobre `Gasto` agrupada por `usuarioId`.

## Propiedades Testeables (PBT-01)

| ID | Categoría | Propiedad |
|---|---|---|
| PROP-11 | Invariante (conservación) | Para cualquier grupo y cualquier conjunto de gastos generado, `SUM(aporte por miembro)` es exactamente igual a `SUM(gastos del grupo)`. |
| PROP-12 | Invariante | El monto gastado calculado de una categoría nunca es negativo, para cualquier secuencia de gastos válidos generados (todos con `monto > 0` por BR-14). |
| PROP-13 | Invariante (multi-tenant) | El estado de presupuesto y el aporte por miembro de un grupo nunca incluyen gastos de otro grupo (extensión de PROP-08 a este dominio). |
