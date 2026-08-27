# Plan de Generación de Historias de Usuario — FamilyFinance

**Rol asumido**: Product Owner

## Checklist de Ejecución

- [ ] Confirmar personas de usuario (Pregunta 1)
- [ ] Confirmar enfoque de desglose y granularidad de historias (Pregunta 2)
- [ ] Confirmar formato de historia y criterios de aceptación (Preguntas 3-4)
- [ ] Confirmar contexto de negocio / criterio de éxito (Pregunta 5)
- [ ] Confirmar restricción técnica de registro (Pregunta 6)
- [ ] Generar `aidlc-docs/inception/user-stories/personas.md`
- [ ] Generar `aidlc-docs/inception/user-stories/stories.md` con historias que cumplan INVEST (Independientes, Negociables, Valiosas, Estimables, Pequeñas, Testeables)
- [ ] Incluir criterios de aceptación por cada historia
- [ ] Mapear cada persona a sus historias relevantes

---

## Enfoques de Desglose Posibles (para la Pregunta 2)

| Enfoque | Descripción | Ventaja | Desventaja |
|---|---|---|---|
| **Por Epic/Feature** | Un epic por cada área funcional (Autenticación, Grupos familiares, Gastos, etc. — ya alineado con los RF-01 a RF-11 de `requirements.md`), con historias pequeñas dentro | Trazabilidad directa a los requisitos ya aprobados; fácil de planificar por unidades en Construction | Puede fragmentar journeys que cruzan varias áreas |
| **Por Journey de usuario** | Historias organizadas según el flujo que recorre una persona (registro → crear grupo → primer gasto) | Muy intuitivo para validar la experiencia completa | Menos directo para mapear a los requisitos ya escritos por área |
| **Por Persona** | Agrupar todas las historias del Administrador por un lado, todas las del Miembro por otro | Útil si los dos roles se construyen en paralelo | Duplica contexto compartido entre ambos roles |
| **Por Dominio** | Agrupar por dominio de negocio (Identidad/Auth, Finanzas, Hogar/Alacena, Planificación) | Balance entre feature y journey | Requiere definir los dominios explícitamente |
| **Híbrido** | Epics por feature (como arriba) + para los epics más grandes (Autenticación, Grupos familiares), ordenar sus historias internas siguiendo el journey de onboarding | Combina trazabilidad a requisitos con claridad de flujo | Ligeramente más trabajo de organización |

**Recomendación**: Híbrido — Epics por feature/RF (trazabilidad directa a `requirements.md` y a las futuras Units de Construction) con las historias de Autenticación y Grupos familiares ordenadas como journey de onboarding.

---

## Preguntas de Planificación

### Pregunta 1: Personas de Usuario
¿Qué personas deben modelarse para las historias?

A) Solo 2 personas: **Administrador de grupo familiar** (crea el grupo, invita miembros, ve todo) y **Miembro de grupo familiar** (usa las funciones del día a día)

B) Las 2 anteriores + **Usuario recién registrado sin grupo** como persona/estado de onboarding propio (aún no creó ni se unió a un grupo)

C) Las 2 de la opción A + **Invitado** (recibió un link/correo de invitación pero todavía no la acepta) como persona propia

D) B y C juntas — 4 personas/estados en total

X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Pregunta 2: Enfoque de Desglose de Historias
¿Qué enfoque de la tabla de arriba prefieres para organizar las historias?

A) Por Epic/Feature (alineado a los RF de requirements.md) — **recomendado**

B) Por Journey de usuario

C) Por Persona

D) Por Dominio de negocio

E) Híbrido (Epics por feature, con Autenticación y Grupos familiares ordenados como journey) — **recomendado si quieres lo mejor de ambos**

X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Pregunta 3: Formato de Historia y Criterios de Aceptación
¿Qué formato usamos?

A) Formato estándar **"Como [persona], quiero [funcionalidad], para [beneficio]"** + criterios de aceptación en **Given/When/Then** — recomendado dado el nivel de riesgo (datos financieros, multi-tenant, seguridad)

B) Formato estándar sin Given/When/Then — criterios de aceptación como lista simple de condiciones

X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Pregunta 4: Profundidad de los Criterios de Aceptación
¿Qué tan exhaustivos deben ser los criterios de aceptación de cada historia?

A) Detallados — cubriendo camino feliz, casos borde y casos de error (ej. qué pasa si el correo de invitación ya está registrado, si falla el login de Google, si dos miembros editan el mismo gasto a la vez) — **recomendado** dado que hay extensiones de Seguridad y PBT habilitadas con enforcement bloqueante

B) Básicos — solo camino feliz, sin casos de error (los casos de error se definirán más adelante en Functional Design)

X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Pregunta 5: Criterio de Éxito / Contexto de Negocio
¿Cómo definimos que las historias de este ciclo "funcionan" desde el punto de vista de negocio?

A) Éxito = una familia completa el ciclo **registro → crear grupo → invitar miembros → registrar y ver gastos compartidos** sin fricción — **recomendado** como criterio mínimo viable para este ciclo

B) Existen métricas de negocio específicas que quiero incorporar (indícalas en Other: ej. tasa de conversión, retención a 30 días, etc.)

C) Aún no hay métricas de negocio definidas — solo enfocarse en que el flujo funcione correctamente

X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Pregunta 6: Alcance del Registro (Autenticación)
`requirements.md` (RF-01) especifica registro con cuenta de Google. ¿Es la única forma de entrar, o también debe existir una alternativa con correo/contraseña?

A) Exclusivamente Google (más simple y seguro, sin gestionar contraseñas propias) — **recomendado**, consistente con RF-01 y con NFR-01 (menor superficie de ataque)

B) Google + alternativa de registro con correo/contraseña

X) Other (please describe after [Answer]: tag below)

[Answer]: 
