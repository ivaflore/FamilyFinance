# FamilyFinance

Gestión financiera compartida para grupos familiares: registra gastos, controla el presupuesto, comparte la alacena y la lista de compras, planifica el menú del mes y recibe sugerencias de ahorro — todo compartido en tiempo real entre los miembros de tu familia.

Este repositorio fue construido siguiendo el flujo de trabajo [AI-DLC](https://github.com/awslabs/aidlc-workflows). Toda la documentación de requisitos, historias de usuario, diseño y decisiones de arquitectura vive en [`aidlc-docs/`](./aidlc-docs/).

## Estructura del repositorio

```
familyfinance/
├── backend/     API REST (Node.js + TypeScript + Express + Prisma + PostgreSQL)
├── frontend/    Interfaz web (Vite + TypeScript, sin framework)
├── docker-compose.yml
├── Dockerfile
└── aidlc-docs/  Documentación del proceso AI-DLC (requisitos, diseño, etc.)
```

## Requisitos previos

- Node.js 20+
- PostgreSQL 16 (o Docker, para levantar todo con `docker-compose`)
- Una cuenta de Google Cloud para crear las credenciales de "Sign in with Google"

### Crear las credenciales de Google (obligatorio para el login)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**.
2. Crea un **OAuth Client ID** de tipo **Web application**.
3. En **Authorized JavaScript origins**, agrega la URL donde correrá el frontend (ej. `http://localhost:5173` en desarrollo, o tu dominio en producción).
4. Copia el **Client ID** generado — lo necesitarás en dos lugares (ver abajo).

## Opción A: correr todo con Docker (recomendado)

```bash
cp backend/.env.example .env
# Edita .env y reemplaza GOOGLE_CLIENT_ID por el Client ID real de Google Cloud
docker compose up --build
```

La app queda disponible en `http://localhost:3000` (el backend sirve también el frontend ya compilado).

## Opción B: correr en modo desarrollo (sin Docker)

### 1. Base de datos

```bash
# Si no tienes PostgreSQL corriendo:
createuser familyfinance --pwprompt --createdb   # password: familyfinance
createdb familyfinance -O familyfinance
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edita .env: agrega tu GOOGLE_CLIENT_ID real
npm install
npx prisma migrate dev
npm run dev        # http://localhost:3000
```

### 3. Frontend (en otra terminal)

```bash
cd frontend
cp .env.example .env
# Edita .env: agrega el mismo GOOGLE_CLIENT_ID
npm install
npm run dev         # http://localhost:5173 (proxya /api hacia :3000)
```

Abre `http://localhost:5173` en tu navegador (o en el celular de tu red local) e inicia sesión con Google.

## Pruebas

El backend incluye pruebas basadas en propiedades (con `fast-check`) para las reglas de negocio identificadas en `aidlc-docs/construction/*/functional-design/`:

```bash
cd backend
npm test
```

## Primeros pasos dentro de la app

1. Inicia sesión con tu cuenta de Google.
2. Crea tu grupo familiar (quedas como Administrador).
3. Invita a los demás miembros de tu familia desde "Mi familia" → "Invitar" (comparte el link generado).
4. Empieza a registrar gastos, definir tu presupuesto, y usar el resto de las secciones — todo se sincroniza automáticamente entre los miembros del grupo.

## Instalar como app (PWA)

FamilyFinance es una Progressive Web App instalable en el celular (Android/iOS) o el computador: desde el navegador, usa la opción "Instalar app" / "Agregar a la pantalla de inicio". Las pantallas compartidas (Alacena, Lista de compras, Menú del mes) se refrescan solas cada 10 segundos para que los cambios de otros miembros aparezcan sin recargar.

Para activar las notificaciones push (avisos de gastos grandes, tareas asignadas, nuevos miembros), configura `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` (ver `backend/.env.example`) y usa el botón "Activar notificaciones" en el pie de la barra lateral.

## Roadmap (fuera de alcance de este ciclo)

- App nativa publicada en Google Play Store (hoy es una PWA instalable, no un paquete nativo en la tienda).
- Ver `aidlc-docs/inception/requirements/requirements.md` para el detalle completo de alcance y fuera de alcance.

## Seguridad

- El registro es exclusivamente vía Google OAuth — no se gestionan contraseñas propias.
- Cada grupo familiar tiene sus datos completamente aislados de los demás (ver `aidlc-docs/construction/identidad-autenticacion/nfr-design/nfr-design.md`).
- Nunca subas tu archivo `.env` al repositorio (ya está en `.gitignore`).
