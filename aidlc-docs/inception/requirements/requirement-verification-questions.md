# Preguntas de Verificación de Requisitos

Tu solicitud fue instalar AI-DLC e iniciar la fase de Inception, sin especificar aún qué construir o mejorar a continuación en FamilyFinance. Para generar el documento de requisitos necesito que respondas las siguientes preguntas completando el tag `[Answer]:` de cada una. Si ninguna opción calza, usa la última opción (Other) y describe tu respuesta.

## Pregunta 1: Objetivo principal de este ciclo de trabajo
¿Cuál es el objetivo principal que quieres que AI-DLC planifique a partir de aquí para FamilyFinance?

A) Convertir el prototipo actual (solo navegador, sin backend) en una app real con backend y base de datos, para que los 4 miembros de la familia vean y editen los mismos datos desde distintos dispositivos

B) Mantenerla como app 100% del lado del cliente (sin backend), pero endurecerla: corregir los riesgos de seguridad detectados (XSS vía innerHTML, dependencias CDN sin integrity) y agregar pruebas automatizadas

C) Agregar una funcionalidad nueva y específica a la app actual (la describo en la opción Other)

D) Todavía no lo tengo claro — quiero que me ayudes a decidir en base a lo encontrado en la ingeniería inversa

X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Pregunta 2: Alcance de esta iteración
¿Qué tan grande debería ser el alcance de este ciclo de trabajo?

A) Acotado — un solo cambio o mejora concreta, para iterar rápido y ver resultados pronto

B) Amplio — cubrir varias mejoras relacionadas (por ejemplo, backend + autenticación + sincronización) en un mismo ciclo

C) Solo quiero un plan/roadmap por ahora, sin generar código todavía

X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Pregunta 3: Prioridad de calidad para este ciclo
De los hallazgos de la ingeniería inversa, ¿cuál debería priorizarse primero?

A) Seguridad (sanear `innerHTML`, evitar XSS, integrity en CDNs)

B) Persistencia/datos compartidos entre miembros de la familia (backend real en vez de localStorage)

C) Pruebas automatizadas y calidad de código (linting, tests)

D) Ninguna en particular — priorizar según lo que decidas tú como responsable técnico

X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Pregunta 4: Extensión — Seguridad
¿Deberían aplicarse las reglas de la extensión "Security Baseline" como restricciones obligatorias durante el resto del flujo (Construction incluido)?

A) Sí — aplicar todas las reglas de SEGURIDAD como restricciones bloqueantes (recomendado para apps de producción)

B) No — omitir las reglas de SEGURIDAD (adecuado para prototipos y proyectos experimentales)

X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Pregunta 5: Extensión — Pruebas basadas en propiedades (Property-Based Testing)
¿Deberían aplicarse las reglas de "Property-Based Testing" como restricciones obligatorias?

A) Sí — aplicar todas las reglas de PBT como restricciones bloqueantes (recomendado si hay lógica de negocio, transformaciones de datos o componentes con estado)

B) Parcial — aplicar reglas de PBT solo a funciones puras y round-trips de serialización

C) No — omitir las reglas de PBT (adecuado para apps CRUD simples o interfaces sin lógica de negocio compleja)

X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Pregunta 6: Extensión — Resiliencia
¿Debería aplicarse el "Resiliency Baseline" (buenas prácticas de diseño orientadas a tolerancia a fallos, disponibilidad y recuperación, basadas en el AWS Well-Architected Framework) durante el resto del flujo?

A) Sí — aplicar el baseline de resiliencia como guía de diseño (recomendado si se construye un backend real para la app)

B) No — omitir el baseline de resiliencia (adecuado para prototipos donde iterar rápido importa más que la disponibilidad)

X) Other (please describe after [Answer]: tag below)

[Answer]: 
