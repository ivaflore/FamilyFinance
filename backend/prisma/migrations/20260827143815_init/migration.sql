-- CreateEnum
CREATE TYPE "EstadoSesion" AS ENUM ('Activa', 'Expirada', 'Invalidada');

-- CreateEnum
CREATE TYPE "RolMembresia" AS ENUM ('Administrador', 'Miembro');

-- CreateEnum
CREATE TYPE "EstadoInvitacion" AS ENUM ('Pendiente', 'Aceptada', 'Expirada', 'Revocada');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "googleSub" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaUltimoLogin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sesion" (
    "token" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" TIMESTAMP(3) NOT NULL,
    "fechaUltimaActividad" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaInvalidacion" TIMESTAMP(3),
    "estado" "EstadoSesion" NOT NULL DEFAULT 'Activa',

    CONSTRAINT "Sesion_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "GrupoFamiliar" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrupoFamiliar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membresia" (
    "id" TEXT NOT NULL,
    "grupoFamiliarId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "rol" "RolMembresia" NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membresia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitacion" (
    "id" TEXT NOT NULL,
    "grupoFamiliarId" TEXT NOT NULL,
    "tokenInvitacionHash" TEXT NOT NULL,
    "correoInvitado" TEXT,
    "estado" "EstadoInvitacion" NOT NULL DEFAULT 'Pendiente',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" TIMESTAMP(3) NOT NULL,
    "creadaPorUsuarioId" TEXT NOT NULL,

    CONSTRAINT "Invitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" TEXT NOT NULL,
    "grupoFamiliarId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "categoria" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presupuesto" (
    "id" TEXT NOT NULL,
    "grupoFamiliarId" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "montoAsignado" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "Presupuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductoAlacena" (
    "id" TEXT NOT NULL,
    "grupoFamiliarId" TEXT NOT NULL,
    "icono" TEXT NOT NULL DEFAULT '📦',
    "nombre" TEXT NOT NULL,
    "cantidadTexto" TEXT NOT NULL,
    "porAgotarse" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductoAlacena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemCompra" (
    "id" TEXT NOT NULL,
    "grupoFamiliarId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precioEstimado" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "comprado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ItemCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receta" (
    "id" TEXT NOT NULL,
    "grupoFamiliarId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipos" TEXT[],
    "tiempoMin" INTEGER NOT NULL,
    "porciones" INTEGER NOT NULL,
    "ingredientes" JSONB NOT NULL,
    "pasos" TEXT[],

    CONSTRAINT "Receta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanificacionDia" (
    "id" TEXT NOT NULL,
    "grupoFamiliarId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tipoComida" TEXT NOT NULL,
    "recetaId" TEXT NOT NULL,

    CONSTRAINT "PlanificacionDia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductoSegmentado" (
    "id" TEXT NOT NULL,
    "grupoFamiliarId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "frecuencia" TEXT NOT NULL,
    "precioUnitario" DECIMAL(12,2) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "segmento" TEXT NOT NULL,
    "justificacion" TEXT NOT NULL,

    CONSTRAINT "ProductoSegmentado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_googleSub_key" ON "Usuario"("googleSub");

-- CreateIndex
CREATE INDEX "Sesion_usuarioId_idx" ON "Sesion"("usuarioId");

-- CreateIndex
CREATE INDEX "Membresia_usuarioId_idx" ON "Membresia"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Membresia_grupoFamiliarId_usuarioId_key" ON "Membresia"("grupoFamiliarId", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitacion_tokenInvitacionHash_key" ON "Invitacion"("tokenInvitacionHash");

-- CreateIndex
CREATE INDEX "Invitacion_grupoFamiliarId_idx" ON "Invitacion"("grupoFamiliarId");

-- CreateIndex
CREATE INDEX "Gasto_grupoFamiliarId_idx" ON "Gasto"("grupoFamiliarId");

-- CreateIndex
CREATE INDEX "Gasto_grupoFamiliarId_categoria_idx" ON "Gasto"("grupoFamiliarId", "categoria");

-- CreateIndex
CREATE UNIQUE INDEX "Presupuesto_grupoFamiliarId_categoria_key" ON "Presupuesto"("grupoFamiliarId", "categoria");

-- CreateIndex
CREATE INDEX "ProductoAlacena_grupoFamiliarId_idx" ON "ProductoAlacena"("grupoFamiliarId");

-- CreateIndex
CREATE INDEX "ItemCompra_grupoFamiliarId_idx" ON "ItemCompra"("grupoFamiliarId");

-- CreateIndex
CREATE INDEX "Receta_grupoFamiliarId_idx" ON "Receta"("grupoFamiliarId");

-- CreateIndex
CREATE INDEX "PlanificacionDia_grupoFamiliarId_idx" ON "PlanificacionDia"("grupoFamiliarId");

-- CreateIndex
CREATE INDEX "PlanificacionDia_grupoFamiliarId_fecha_idx" ON "PlanificacionDia"("grupoFamiliarId", "fecha");

-- CreateIndex
CREATE INDEX "ProductoSegmentado_grupoFamiliarId_idx" ON "ProductoSegmentado"("grupoFamiliarId");

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membresia" ADD CONSTRAINT "Membresia_grupoFamiliarId_fkey" FOREIGN KEY ("grupoFamiliarId") REFERENCES "GrupoFamiliar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membresia" ADD CONSTRAINT "Membresia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitacion" ADD CONSTRAINT "Invitacion_grupoFamiliarId_fkey" FOREIGN KEY ("grupoFamiliarId") REFERENCES "GrupoFamiliar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitacion" ADD CONSTRAINT "Invitacion_creadaPorUsuarioId_fkey" FOREIGN KEY ("creadaPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_grupoFamiliarId_fkey" FOREIGN KEY ("grupoFamiliarId") REFERENCES "GrupoFamiliar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presupuesto" ADD CONSTRAINT "Presupuesto_grupoFamiliarId_fkey" FOREIGN KEY ("grupoFamiliarId") REFERENCES "GrupoFamiliar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoAlacena" ADD CONSTRAINT "ProductoAlacena_grupoFamiliarId_fkey" FOREIGN KEY ("grupoFamiliarId") REFERENCES "GrupoFamiliar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCompra" ADD CONSTRAINT "ItemCompra_grupoFamiliarId_fkey" FOREIGN KEY ("grupoFamiliarId") REFERENCES "GrupoFamiliar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receta" ADD CONSTRAINT "Receta_grupoFamiliarId_fkey" FOREIGN KEY ("grupoFamiliarId") REFERENCES "GrupoFamiliar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanificacionDia" ADD CONSTRAINT "PlanificacionDia_grupoFamiliarId_fkey" FOREIGN KEY ("grupoFamiliarId") REFERENCES "GrupoFamiliar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanificacionDia" ADD CONSTRAINT "PlanificacionDia_recetaId_fkey" FOREIGN KEY ("recetaId") REFERENCES "Receta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoSegmentado" ADD CONSTRAINT "ProductoSegmentado_grupoFamiliarId_fkey" FOREIGN KEY ("grupoFamiliarId") REFERENCES "GrupoFamiliar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
