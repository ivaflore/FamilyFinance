# Unidades de Trabajo — FamilyFinance

6 unidades, una por componente de `components.md` (Pregunta 1 = A), construidas de forma incremental en el orden que se indica, en un único desarrollador por ahora (Pregunta 2 = A).

---

## Unidad 1: Identidad y Autenticación

- **Responsabilidad**: Login exclusivo con Google OAuth, emisión/validación de sesión, perfil de usuario.
- **Historias cubiertas**: US-01.
- **Orden de construcción**: 1ª — es la base de todo el sistema, ninguna otra unidad puede probarse sin un usuario autenticado.
- **Depende de**: Ninguna.

## Unidad 2: Grupos Familiares

- **Responsabilidad**: Crear grupo, invitar/aceptar invitaciones, roles (Administrador/Miembro), y resolución del `grupoFamiliarId` activo (base del aislamiento multi-tenant, SECURITY-08).
- **Historias cubiertas**: US-02, US-03, US-04, US-05, US-06, US-07.
- **Orden de construcción**: 2ª — depende de Identidad; bloquea a todas las unidades financieras/de hogar porque cada dato pertenece a un grupo.
- **Depende de**: Unidad 1.

## Unidad 3: Núcleo Financiero

- **Responsabilidad**: Gastos, presupuesto por categoría, panel de aporte por miembro.
- **Historias cubiertas**: US-08, US-09, US-10, US-11, US-19.
- **Orden de construcción**: 3ª — depende de Grupos Familiares (vía Middleware de Autorización).
- **Depende de**: Unidad 2.

## Unidad 4: Hogar

- **Responsabilidad**: Alacena, lista de compras, recetario, calendario/menú mensual.
- **Historias cubiertas**: US-12, US-13, US-14, US-15, US-16.
- **Orden de construcción**: 4ª — depende de Grupos Familiares. Puede avanzar en paralelo con Núcleo Financiero si en el futuro se suma otra persona al equipo (no dependen entre sí), pero con un solo desarrollador (Pregunta 2 = A) se construye secuencialmente después de Núcleo Financiero.
- **Depende de**: Unidad 2.

## Unidad 5: Insights

- **Responsabilidad**: Segmentación de productos, asistente local basado en datos reales.
- **Historias cubiertas**: US-17, US-18.
- **Orden de construcción**: 5ª — depende de Núcleo Financiero y Hogar (necesita que existan datos de gastos/alacena para tener sentido).
- **Depende de**: Unidad 3, Unidad 4.

## Unidad 6: Frontend Web

- **Responsabilidad**: Interfaz web responsive, consumidora de la API REST de todas las unidades anteriores.
- **Historias cubiertas**: US-20 (y, transversalmente, la interfaz de todas las demás historias — ver `unit-of-work-story-map.md`).
- **Orden de construcción**: 6ª formalmente, pero puede **empezar en paralelo** tan pronto como los contratos de API de la Unidad 1 y la Unidad 2 estén definidos (no necesita esperar a que el backend esté 100% terminado si los contratos ya están acordados desde Application Design/`component-methods.md`).
- **Depende de**: Unidad 1, Unidad 2 (contratos mínimos); idealmente de todas para tener el producto completo.

---

## Estrategia de Organización de Código (Greenfield)

El código de FamilyFinance se escribe desde cero (el prototipo `index.html` queda solo como referencia visual — ver Aclaración 2 de Requirements Analysis). Organización de repositorio (Pregunta 3 = A, monorepo):

```
familyfinance/                  (repositorio raíz)
├── backend/
│   ├── identidad/              (Unidad 1)
│   ├── grupos-familiares/      (Unidad 2)
│   ├── nucleo-financiero/      (Unidad 3)
│   ├── hogar/                  (Unidad 4)
│   ├── insights/               (Unidad 5)
│   └── middleware/             (transversal — Autorización, SECURITY-08)
├── frontend/                   (Unidad 6)
└── aidlc-docs/                 (documentación del flujo AI-DLC, ya existente)
```

**Nota**: la estructura interna de cada carpeta (lenguaje, framework, capas Controlador/Servicio/Repositorio) se definirá en **NFR Requirements** y **Code Generation** (Construction, por unidad) — aquí solo se fija el límite de carpetas de alto nivel, consistente con los componentes de Application Design.
