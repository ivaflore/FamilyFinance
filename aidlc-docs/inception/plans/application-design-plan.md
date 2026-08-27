# Plan de Application Design — FamilyFinance

## Checklist de Ejecución

- [ ] Confirmar identificación y límites de componentes (Pregunta 1)
- [ ] Confirmar estilo arquitectónico (Pregunta 2)
- [ ] Confirmar estilo de API entre frontend y backend (Pregunta 3)
- [ ] Confirmar patrón de orquestación entre componentes (Pregunta 4)
- [ ] Confirmar patrón de capas dentro de cada componente (Pregunta 5)
- [ ] Generar `aidlc-docs/inception/application-design/components.md` (definición y responsabilidades de cada componente)
- [ ] Generar `aidlc-docs/inception/application-design/component-methods.md` (firmas de métodos de alto nivel por componente)
- [ ] Generar `aidlc-docs/inception/application-design/services.md` (definición de servicios y orquestación)
- [ ] Generar `aidlc-docs/inception/application-design/component-dependency.md` (matriz de dependencias y patrones de comunicación)
- [ ] Generar `aidlc-docs/inception/application-design/application-design.md` (documento consolidado)
- [ ] Validar consistencia y completitud del diseño

**Nota**: Este diseño es de alto nivel (componentes, responsabilidades, firmas de métodos). La lógica de negocio detallada de cada componente se define después, en **Functional Design**, dentro de Construction, por cada unidad. La selección de stack tecnológico específico (lenguajes, frameworks, base de datos concreta) se define en **NFR Requirements**, no aquí — este diseño es intencionalmente agnóstico de tecnología.

---

## Preguntas de Planificación

### Pregunta 1: Identificación y Límites de Componentes
`execution-plan.md` propuso una secuencia de unidades (Identidad, Grupos Familiares, Núcleo Financiero, Hogar, Insights, Frontend). ¿Usamos esos mismos límites como los componentes de la aplicación?

A) Sí, igual a la secuencia ya propuesta: **Identidad y Autenticación**, **Grupos Familiares**, **Núcleo Financiero** (Gastos + Presupuesto + Panel de Familia), **Hogar** (Alacena + Lista de Compras + Recetario + Calendario), **Insights** (Segmentación de Productos + Asistente), y **Frontend Web** — **recomendado**, mantiene trazabilidad directa con requirements.md y con la secuencia de unidades ya acordada

B) Más granular: un componente separado por cada uno de los 11 requisitos funcionales

C) Más agregado: solo 2 componentes grandes — "Identidad y Grupos" y "Finanzas del Hogar" (todo lo demás)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Pregunta 2: Estilo Arquitectónico del Backend
¿Qué estilo arquitectónico usamos para el backend?

A) **Monolito modular** — un solo servicio desplegable, con los componentes de la Pregunta 1 como módulos internos bien separados — **recomendado**: es un proyecto individual/pequeño (confirmado en la extensión de Resiliencia: sin proceso formal de cambios todavía), más simple y barato de operar, y se puede dividir en microservicios más adelante si el producto crece

B) **Microservicios** — un servicio desplegable independiente por componente — mayor complejidad operativa y de infraestructura; recomendable solo si se anticipa escalar el equipo o el tráfico pronto

C) **Funciones serverless** independientes por caso de uso (ej. una función por endpoint)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Pregunta 3: Estilo de API entre Frontend y Backend
¿Cómo se comunican el frontend web y el backend?

A) **REST + JSON** — más simple, estándar, suficiente para las necesidades actuales — **recomendado**

B) **GraphQL** — más flexible para combinar datos de varios componentes en una sola consulta (útil, por ejemplo, para pantallas que mezclan gastos + presupuesto + alacena), pero más complejo de implementar y mantener para un proyecto de este tamaño

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Pregunta 4: Orquestación entre Componentes
Dado el estilo arquitectónico elegido en la Pregunta 2, ¿cómo se comunican los componentes/módulos entre sí?

A) **Llamadas directas síncronas** entre módulos dentro del mismo backend, con una capa delgada de API que aplica autenticación/autorización antes de llegar a cada módulo — **recomendado** si se elige monolito modular (Pregunta 2 = A)

B) **Eventos/mensajería interna** entre módulos — más desacoplado, pero más complejo de razonar y depurar para un proyecto de este tamaño

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Pregunta 5: Patrón de Capas dentro de cada Componente
¿Qué patrón de capas usamos dentro de cada componente del backend?

A) **Capas clásicas**: Controlador/API → Servicio (lógica de negocio) → Repositorio (acceso a datos) — **recomendado**, simple y ampliamente entendido, facilita que Functional Design (Construction) defina la lógica de negocio dentro de la capa de Servicio

B) **Arquitectura hexagonal / puertos y adaptadores** — más flexible para testear e intercambiar infraestructura, pero más compleja de aprender y mantener para un proyecto de este tamaño

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Restricción de Diseño ya Definida (no es una pregunta abierta)

**Autorización multi-tenant**: Dado que la extensión **Security Baseline** está habilitada con cumplimiento bloqueante (Regla **SECURITY-08**, Control de Acceso a Nivel de Aplicación), esto **no es una decisión opcional**: cada request autenticado debe llevar el `grupoFamiliarId` activo del usuario (derivado de su sesión/membresía, nunca de un parámetro que el cliente pueda manipular libremente), y **todos** los componentes de negocio deben filtrar sus consultas por ese `grupoFamiliarId`. Esto se documentará directamente en `component-dependency.md` y `application-design.md` como restricción transversal, y se verificará en cada etapa posterior (Functional Design, Code Generation) según lo exige la extensión.

## Nota de Confirmación

El usuario confirmó las 5 preguntas con la opción A (monolito modular, REST, llamadas síncronas, capas clásicas), tras plantear inicialmente la opción B en las 5 (microservicios/GraphQL/eventos/hexagonal) y preguntar por una recomendación. Se aclaró explícitamente que un **monolito modular multi-tenant sirve igual para que se suscriban varias familias** — la capacidad de servir a múltiples grupos familiares (multi-tenencia) es una decisión del **modelo de datos y la capa de autorización** (cada fila pertenece a un `grupoFamiliarId`), no una decisión de **estilo arquitectónico de despliegue** (monolito vs. microservicios). Ambos estilos pueden ser igualmente multi-tenant; el monolito modular simplemente es más barato y simple de operar para el tamaño actual del proyecto, sin sacrificar la capacidad de escalar a muchas familias suscritas.
