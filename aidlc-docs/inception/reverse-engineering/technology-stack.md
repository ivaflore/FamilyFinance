# Stack Tecnológico

## Lenguajes de Programación
- **HTML5** — N/A (estándar) — Estructura del documento y de los paneles de UI.
- **CSS3** — N/A (estándar, con variables/custom properties) — Sistema de diseño y layout responsive.
- **JavaScript (ES6+)** — N/A (vanilla, sin transpilación) — Toda la lógica de la aplicación (funciones, `async`/`await` removido tras el fix del asistente, `template literals`, `Array` methods como `map`/`filter`/`reduce`).

## Frameworks
- Ninguno. No se usa React, Vue, Angular ni ningún framework de UI; tampoco jQuery ni utilidades DOM de terceros.

## Infraestructura
- Ninguna configurada. La aplicación es un archivo estático; puede alojarse en cualquier hosting de archivos estáticos (no hay requisito de runtime de servidor).

## Herramientas de Build
- Ninguna. No hay `package.json`, `webpack`, `vite`, `esbuild`, ni minificación/bundling. El archivo se sirve tal cual.

## Herramientas de Testing
- Ninguna configurada en el repositorio (sin Jest/Vitest/Playwright/Cypress, etc.).

## Dependencias de Terceros (vía CDN, no como paquetes instalados)
- **Google Fonts** — tipografías `DM Sans` (pesos 300/400/500/600) y `DM Serif Display`.
- **Tabler Icons Webfont `v3.0.0`** (`cdn.jsdelivr.net`) — iconografía de toda la interfaz.

## APIs de Navegador Utilizadas
- **`localStorage`** — persistencia del estado de la aplicación entre sesiones.
- **`Date`** — cálculo de mes/año actual para el calendario y las cabeceras dinámicas del dashboard.
