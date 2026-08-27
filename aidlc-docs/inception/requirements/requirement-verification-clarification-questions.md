# Preguntas de Aclaración — Requirements Analysis

Tus respuestas a `requirement-verification-questions.md` definieron un objetivo mucho más grande que un simple ajuste al prototipo: un producto comercial multi-tenant con registro por cuenta de Google, seguridad reforzada y disponibilidad para Android. Antes de escribir `requirements.md` necesito resolver algunas ambigüedades técnicas que esto introduce, y dos preguntas que las extensiones de Seguridad/Resiliencia que activaste exigen responder en esta etapa.

## Aclaración 1: Alcance técnico de "app para Android"
Hoy la aplicación es un único archivo HTML/CSS/JS sin backend ni framework. "App para Android" puede significar cosas muy distintas en esfuerzo y arquitectura. ¿Qué esperas exactamente?

A) App nativa/multiplataforma publicada en Google Play Store (ej. React Native o Flutter, con o sin versión web en paralelo)

B) Progressive Web App (PWA): la misma app web, instalable desde el navegador de Android (ícono en el launcher, funciona parcialmente offline), sin pasar por Google Play

C) Por ahora, que la app web sea completamente responsive y usable desde el navegador de un celular Android, sin instalación

D) Quiero las tres eventualmente, pero para este primer ciclo prioriza una (indícalo en Other)

X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Aclaración 2: Qué pasa con el prototipo actual (`index.html`)
Para tener backend real, autenticación y datos aislados por grupo familiar, la arquitectura actual (un solo archivo estático sin servidor) no alcanza. ¿Qué debe pasar con el prototipo actual?

A) Se usa como referencia de diseño/UX (mismos colores, paneles y secciones) pero se reconstruye con una arquitectura nueva: frontend + backend separados, base de datos, autenticación

B) Se debe mantener el archivo `index.html` actual tal cual y solo agregarle backend/autenticación por encima, sin rediseñar

C) No tengo preferencia — decide tú la arquitectura más adecuada para cumplir el objetivo comercial

X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Aclaración 3: Alcance del registro de familias/comunidad
Dijiste que cualquier persona debe poder registrarse y "asociar el grupo familiar" para formar una comunidad. ¿Cómo debería funcionar la asociación a un grupo familiar?

A) Un usuario crea un grupo familiar nuevo (queda como administrador) y invita a otros por correo/link; cada grupo ve solo sus propios datos (aislamiento total entre familias — como hoy hay "Familia García" con código GARC-8842)

B) Además de grupos privados, debe existir una "comunidad" pública/compartida donde distintas familias puedan comparar tips de ahorro o precios de forma anónima o agregada

C) Un usuario puede pertenecer a un único grupo familiar a la vez

D) Un usuario puede pertenecer a varios grupos familiares (ej. su propia familia y la de sus padres)

X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Pregunta obligatoria de la extensión de Resiliencia (RESILIENCY-02): Metas de RTO/RPO y estrategia de Recuperación ante Desastres
¿Cuáles son tus metas de Recovery Time Objective (RTO) y Recovery Point Objective (RPO)? Esto determina la estrategia de Disaster Recovery e infraestructura redundante.

A) RPO/RTO: Horas — estrategia Backup & Restore. Costo más bajo ($). Datos respaldados, sin servicios desplegados. Se redespliega desde IaC y se restaura desde backup ante una falla. Adecuado para cargas no críticas.

B) RPO/RTO: Decenas de minutos — estrategia Pilot Light. Costo: $$. Datos activos, servicios inactivos. Infraestructura desplegada pero apagada, se escala al fallar.

C) RPO/RTO: Minutos — estrategia Warm Standby. Costo: $$$. Datos activos, servicios corriendo a capacidad reducida. Adecuado para aplicaciones de negocio críticas.

D) RPO/RTO: Casi en tiempo real — Multi-sitio Activo/Activo. Costo más alto ($$$$). Adecuado para cargas de misión crítica, cero downtime.

E) N/A — un despliegue en una sola región es aceptable, sin DR entre regiones. Basta con multi-zona dentro de una región.

X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Pregunta obligatoria de la extensión de Resiliencia (RESILIENCY-03): Proceso de Gestión de Cambios
¿Cómo deberían gobernarse los cambios a producción para este proyecto?

A) Usar un proceso organizacional existente (indica la herramienta, ej. Jira, ServiceNow, CAB interno)

B) No existe un proceso formal todavía — que AI-DLC proponga uno liviano (registro de cambio + aprobación + nota de rollback) para adoptar

C) No aplica todavía — proyecto individual/pequeño sin proceso formal de cambios por ahora

X) Other (please describe after [Answer]: tag below)

[Answer]: 
