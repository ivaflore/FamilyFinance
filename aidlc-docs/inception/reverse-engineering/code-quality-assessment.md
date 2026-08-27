# Evaluación de Calidad de Código

## Cobertura de Pruebas
- **General**: Ninguna (0%).
- **Pruebas Unitarias**: No existen.
- **Pruebas de Integración**: No existen.
- **Pruebas End-to-End**: No existen (se validó manualmente con un navegador headless durante el desarrollo, pero no quedó como suite de pruebas del repositorio).

## Indicadores de Calidad de Código
- **Linting**: No configurado (sin ESLint/Stylelint/Prettier ni configuración de formato).
- **Estilo de Código**: Consistente dentro del archivo (convención compacta de CSS con variables, funciones JS con nombres descriptivos en inglés para funciones y datos en español para el dominio de negocio).
- **Documentación**: Escasa — sin comentarios de cabecera por función; solo separadores de sección en el CSS/JS. No hay `README.md` en `FamilyFinance` que explique cómo ejecutar o el propósito del proyecto.

## Deuda Técnica

1. **Sin sincronización entre dispositivos/miembros** — Todo el estado vive en `localStorage` del navegador local. Si dos miembros de la familia usan la app desde dispositivos distintos, cada uno ve/edita una copia independiente de los datos; no hay backend que centralice la información real de la familia.
2. **`innerHTML` con texto de usuario sin sanitizar** — Varias funciones de render (`renderGastos`, `renderPantry`, `renderShopList`, `renderRecipes`, `renderSeg`, el chat del Asistente, etc.) insertan directamente en el DOM valores provistos por el propio usuario (descripción de gasto, nombre de producto, nombre/ingredientes/pasos de receta, texto del chat) usando `innerHTML` con *template literals*, sin escapar HTML. Hoy el impacto es bajo porque la app es de un solo usuario/dispositivo sin datos compartidos, pero es un patrón de XSS latente: si en el futuro se agrega backend/sincronización multiusuario, cualquier miembro podría inyectar HTML/JS ejecutable en los datos que ve otro miembro.
3. **Dependencias de CDN sin `integrity` (Subresource Integrity)** — Google Fonts y Tabler Icons se cargan sin atributo `integrity`, por lo que un compromiso del CDN podría alterar el contenido servido sin que el navegador lo detecte.
4. **`localStorage` sin manejo de cuota real** — `saveState()` atrapa excepciones con un `catch` vacío; si el almacenamiento está lleno o deshabilitado (modo privado), el guardado falla silenciosamente y el usuario no se entera de que perdió persistencia.
5. **Sin build ni control de dependencias versionado** — Las versiones de las fuentes externas (Google Fonts) no están fijadas; solo Tabler Icons tiene versión explícita en la URL. No hay `package-lock`/`package.json` que documente y fije el stack.
6. **Sin pruebas automatizadas ni CI** — No hay pipeline que valide cambios (lint, tests, build) antes de fusionarlos.

## Hallazgo ya remediado (contexto histórico)
- El "Asistente IA" llamaba directamente a `https://api.anthropic.com/v1/messages` desde el navegador con una API key vacía y sin los headers requeridos (`x-api-key`, `anthropic-version`), lo cual además de estar roto funcionalmente, habría expuesto cualquier API key real a quien viera el código fuente. Fue reemplazado por `generateAIResponse()`, que genera respuestas localmente a partir de los datos reales de la app, sin llamadas de red. **Este hallazgo ya fue corregido** antes de esta etapa de ingeniería inversa, pero se documenta como antecedente relevante para las decisiones de arquitectura de Requirements Analysis (p. ej., si se decide integrar un LLM real, deberá hacerse vía un backend/proxy, nunca con la key en el cliente).

## Patrones y Anti-Patrones

### Buenos Patrones
- **Sistema de diseño con tokens CSS** (`:root { --teal:...; }`) — consistencia visual y fácil de retematizar.
- **Separación por secciones con `render*()` dedicado por dominio** — cada área de negocio tiene su propia función de renderizado, lo que hace el código predecible y fácil de ubicar.
- **Persistencia centralizada** (`saveState()`/`loadState()`) — un único punto de serialización, en vez de guardar cada entidad por separado.
- **Cálculos derivados centralizados en `renderDashboard()`** — el dashboard ya no usa cifras fijas; se calcula desde `budgets`/`pantry` en tiempo real, evitando inconsistencias de datos.

### Anti-Patrones
- **Todo en un único archivo global** (~1400 líneas) — sin módulos, todo vive en el `<script>` global; a medida que crezca la app esto dificultará el mantenimiento y las pruebas.
- **Mutación de estado global sin capa de acceso** — cualquier función puede mutar directamente los arrays globales (`gastos.push(...)`, `budget.spent += monto`), lo que facilita bugs de sincronización a medida que crecen las interacciones entre secciones.
- **`innerHTML` como único mecanismo de renderizado** — sin un motor de plantillas seguro (o al menos una función de *escape* de HTML), como se detalla en el punto 2 de Deuda Técnica.
