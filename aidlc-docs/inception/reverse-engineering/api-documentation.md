# Documentación de API

## APIs REST
No existen. La aplicación no tiene backend propio ni expone/consume endpoints REST en su estado actual. (Ver `code-quality-assessment.md` sobre la llamada previa, insegura y ya removida, a `api.anthropic.com` desde el navegador.)

## APIs Internas (funciones JavaScript expuestas globalmente)

Dado que no hay módulos ES ni clases, la "API interna" son las funciones globales que el HTML invoca mediante atributos `onclick`/`oninput`/`onchange`. Las más relevantes:

### Navegación
- **`goTo(id, btn)`** — Cambia el panel visible y dispara el `render*()` correspondiente.
  - Parámetros: `id` (string, id del panel sin el prefijo `panel-`), `btn` (elemento del botón que disparó la navegación, opcional).
  - Retorno: `void` (efecto en el DOM).

### Gastos
- **`addGasto()`** — Lee el formulario de gasto, agrega el registro a `gastos`, incrementa `budgets[cat].spent`, re-renderiza Gastos/Presupuesto/Dashboard y persiste el estado.
- **`renderGastos()`** — Repinta la tabla de historial de gastos y el contador de gastos "de hoy" en el badge de navegación.

### Alacena
- **`saveAddPantry()`** — Agrega un producto a `pantry` desde el modal de alta.
- **`renderPantry()`** — Repinta la grilla de productos y los contadores del panel.

### Lista de compras
- **`saveAddShop()` / `toggleShopItem(id)`** — Agregan o marcan como comprado un ítem de `shopItems`.
- **`generateShopFromCalendar()`** — Recorre `calendarData`, agrega los ingredientes de las recetas planificadas que aún no están en la lista.

### Presupuesto y Dashboard
- **`renderBudget()`** — Repinta el detalle de presupuesto por categoría a partir de `budgets`.
- **`renderDashboard()`** — Calcula gasto total y presupuesto restante desde `budgets`, y el conteo de alacena desde `pantry`; repinta las tarjetas de métricas y las barras por categoría.

### Recetario y Calendario
- **`saveNewRecipe()`** — Agrega una receta a `recipes` desde el formulario del modal.
- **`confirmAddToCalendar(recipeId)` / `addMealFromModal(key, day)`** — Asocian una receta a un día del `calendarData` (clave `"{año}-{mesIndice}-{día}"`).
- **`renderCalendar()`** — Dibuja la grilla del mes actual con las comidas planificadas.

### Segmentación
- **`changeSegProduct(id, newSeg)`** — Reclasifica un producto de `segProducts` entre `cat1`/`cat2`/`saving` y persiste.
- **`renderSeg()`** — Agrupa y totaliza productos por segmento, aplicando filtro de texto y de categoría.

### Asistente
- **`generateAIResponse(text)`** — Función pura que, según palabras clave del texto de entrada, compone una respuesta en HTML usando datos reales (`budgets`, `pantry`, `segProducts`, `recipes`). No realiza llamadas de red.
- **`sendAI()`** — Orquesta la interacción del chat: pinta el mensaje del usuario, un indicador de "Pensando...", y tras un `setTimeout` de UX reemplaza el indicador por la respuesta de `generateAIResponse`.

### Persistencia
- **`saveState()`** — Serializa `{gastos, pantry, shopItems, recipes, calendarData, segProducts, budgets}` a `localStorage` bajo la clave `familyfinance_state_v1`.
- **`loadState()`** — Lee y parsea ese mismo valor si existe.

## Modelos de Datos

### `Gasto` (elemento de `gastos[]`)
- **Campos**: `id` (number), `desc` (string), `cat` (string: `supermercado|transporte|salud|servicios|entretenimiento|otros`), `miembro` (string), `fecha` (string libre: `"hoy"`, `"ayer"`, `"hace Nd"`, `"ahora"`), `monto` (number, CLP).
- **Relaciones**: `cat` se mapea a un nombre de `Budget` vía `CAT_TO_BUDGET` para actualizar el presupuesto al registrar el gasto.
- **Validación**: Solo se exige `desc` y `monto` no vacíos/numéricos en el formulario; sin validación de rango, sin sanitización del texto libre.

### `ProductoAlacena` (elemento de `pantry[]`)
- **Campos**: `id`, `icon` (emoji), `name`, `qty` (string libre), `low` (boolean).
- **Relaciones**: Usado por el Dashboard (conteo y alerta "por agotarse") y por el Asistente (para sugerir recetas y detectar faltantes).

### `ItemCompra` (elemento de `shopItems[]`)
- **Campos**: `id`, `name`, `price` (number), `checked` (boolean).

### `Budget` (elemento de `budgets[]`)
- **Campos**: `name`, `icon`, `spent` (number), `total` (number), `color` (variable CSS).
- **Relaciones**: `addGasto()` incrementa `spent` según la categoría del gasto; `renderDashboard()` y `renderBudget()` derivan de aquí el gasto total y el porcentaje usado.

### `Receta` (elemento de `recipes[]`)
- **Campos**: `id`, `name`, `type` (array de `almuerzo|cena|desayuno`), `time` (minutos), `servings`, `tags` (array), `ingredients` (array de `{n, cat}`), `steps` (array de string).

### `PlanificacionCalendario` (`calendarData`, objeto indexado por clave `"{año}-{mesIndice}-{día}"`)
- **Valor**: array de `{recipeId, type}`.

### `ProductoSegmentado` (elemento de `segProducts[]`)
- **Campos**: `id`, `name`, `cat` (categoría de producto), `freq` (frecuencia de compra), `unit` (precio unitario), `qty`, `total`, `seg` (`cat1|cat2|saving`), `why` (justificación de la clasificación).
