# Plan de Unidades de Trabajo — FamilyFinance

**Definición** (según `units-generation.md`): una unidad de trabajo es una agrupación lógica de historias para efectos de desarrollo. En microservicios, cada unidad es un servicio desplegable independiente. En un monolito (nuestro caso, Application Design = monolito modular), la unidad puede representar toda la aplicación con módulos lógicos, **o** —cuando conviene planificar y construir de forma incremental— cada módulo lógico puede tratarse como su propia unidad de trabajo para efectos de Construction, aunque todas terminen desplegándose juntas como un solo backend.

## Checklist de Ejecución

- [ ] Confirmar granularidad de las unidades de trabajo (Pregunta 1)
- [ ] Confirmar alineación de equipo / paralelización (Pregunta 2)
- [ ] Confirmar organización del repositorio (Pregunta 3)
- [ ] Generar `aidlc-docs/inception/application-design/unit-of-work.md` (definición y responsabilidades de cada unidad)
- [ ] Generar `aidlc-docs/inception/application-design/unit-of-work-dependency.md` (matriz de dependencias entre unidades)
- [ ] Generar `aidlc-docs/inception/application-design/unit-of-work-story-map.md` (mapeo de las 20 historias a unidades)
- [ ] Documentar estrategia de organización de código (ver Pregunta 3 — aplica porque el código nuevo se escribe desde cero, el prototipo solo es referencia visual)
- [ ] Validar que todas las historias (US-01 a US-20) queden asignadas a alguna unidad

---

## Categorías ya Resueltas en Application Design (no se re-preguntan)

- **Dependencies (Dependencias)**: ya documentadas en `component-dependency.md` — Identidad y Autenticación no depende de nadie; Grupos Familiares depende de Identidad; Núcleo Financiero, Hogar e Insights dependen (vía Middleware) de Grupos Familiares; Insights además depende de Núcleo Financiero y Hogar en lectura; Frontend Web depende de todos vía REST.
- **Technical Considerations (consideraciones técnicas)**: ya resuelto — monolito modular (un solo backend desplegable) + Frontend Web como cliente separado; no hay necesidad de escalar/desplegar módulos del backend de forma independiente en este ciclo.
- **Business Domain (dominio de negocio)**: ya resuelto — los 6 componentes de `components.md` son los límites de dominio (Identidad, Grupos Familiares, Núcleo Financiero, Hogar, Insights, Frontend Web).

## Preguntas de Planificación

### Pregunta 1: Granularidad de las Unidades de Trabajo
Dado que elegimos monolito modular, ¿cómo agrupamos los 6 componentes en unidades de trabajo para Construction?

A) **6 unidades, una por componente** (Identidad y Autenticación, Grupos Familiares, Núcleo Financiero, Hogar, Insights, Frontend Web), construidas en el orden ya acordado en `execution-plan.md`, cada una pasando por su propio ciclo de Functional Design → NFR Requirements → NFR Design → Infrastructure Design → Code Generation antes de pasar a la siguiente — **recomendado**: permite construir y validar incrementalmente (por ejemplo, tener login funcionando antes de construir grupos familiares), aunque todas las unidades del backend terminen desplegándose juntas como un solo monolito.

B) **2 unidades**: "Backend" (los 5 componentes de negocio como módulos internos, diseñados y construidos todos juntos en un solo ciclo de Construction) y "Frontend Web" — más fiel a la definición estricta de AI-DLC para monolitos ("la unidad representa toda la aplicación con módulos lógicos"), con menos ciclos de aprobación, pero sin puntos de validación intermedios (no hay una versión funcionando de "solo login" antes de tener todo el backend diseñado).

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Pregunta 2: Alineación de Equipo
¿Vas a construir esto tú solo por ahora, o ya tienes o planeas sumar más personas al equipo pronto?

A) Solo yo por ahora — **recomendado por defecto**: las unidades se construyen de forma secuencial en el orden ya acordado, sin necesidad de coordinar trabajo en paralelo

B) Ya tengo o voy a sumar más personas pronto — en ese caso conviene identificar qué unidades podrían construirse en paralelo (por ejemplo, Hogar y Núcleo Financiero podrían avanzar en paralelo una vez esté lista Grupos Familiares, ya que no dependen entre sí)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Pregunta 3: Organización del Código (aplica — el código se escribe desde cero)
El prototipo actual (`index.html`) se usa solo como referencia visual, no como base de código (ver Aclaración 2 de Requirements Analysis). ¿Cómo organizamos el repositorio para el código nuevo?

A) **Monorepo**: un solo repositorio con carpetas separadas (ej. `/backend`, `/frontend`) — **recomendado**, más simple de versionar y gestionar para un proyecto individual/pequeño

B) **Repositorios separados**: uno para backend, otro para frontend

X) Other (please describe after [Answer]: tag below)

[Answer]: A
