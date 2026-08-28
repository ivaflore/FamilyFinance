-- AlterTable
ALTER TABLE "Gasto" ADD COLUMN     "gastoRecurrenteId" TEXT;

-- CreateTable
CREATE TABLE "GastoRecurrente" (
    "id" TEXT NOT NULL,
    "grupoFamiliarId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "categoria" TEXT NOT NULL,
    "diaDelMes" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GastoRecurrente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingreso" (
    "id" TEXT NOT NULL,
    "grupoFamiliarId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ingreso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoMesada" (
    "id" TEXT NOT NULL,
    "grupoFamiliarId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoMesada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaAhorro" (
    "id" TEXT NOT NULL,
    "grupoFamiliarId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "montoObjetivo" DECIMAL(12,2) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetaAhorro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarea" (
    "id" TEXT NOT NULL,
    "grupoFamiliarId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "asignadoAUsuarioId" TEXT,
    "recompensa" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GastoRecurrente_grupoFamiliarId_idx" ON "GastoRecurrente"("grupoFamiliarId");

-- CreateIndex
CREATE INDEX "Ingreso_grupoFamiliarId_idx" ON "Ingreso"("grupoFamiliarId");

-- CreateIndex
CREATE INDEX "MovimientoMesada_grupoFamiliarId_usuarioId_idx" ON "MovimientoMesada"("grupoFamiliarId", "usuarioId");

-- CreateIndex
CREATE INDEX "MetaAhorro_grupoFamiliarId_usuarioId_idx" ON "MetaAhorro"("grupoFamiliarId", "usuarioId");

-- CreateIndex
CREATE INDEX "Tarea_grupoFamiliarId_idx" ON "Tarea"("grupoFamiliarId");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_usuarioId_idx" ON "PushSubscription"("usuarioId");

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_gastoRecurrenteId_fkey" FOREIGN KEY ("gastoRecurrenteId") REFERENCES "GastoRecurrente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GastoRecurrente" ADD CONSTRAINT "GastoRecurrente_grupoFamiliarId_fkey" FOREIGN KEY ("grupoFamiliarId") REFERENCES "GrupoFamiliar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingreso" ADD CONSTRAINT "Ingreso_grupoFamiliarId_fkey" FOREIGN KEY ("grupoFamiliarId") REFERENCES "GrupoFamiliar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingreso" ADD CONSTRAINT "Ingreso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoMesada" ADD CONSTRAINT "MovimientoMesada_grupoFamiliarId_fkey" FOREIGN KEY ("grupoFamiliarId") REFERENCES "GrupoFamiliar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoMesada" ADD CONSTRAINT "MovimientoMesada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaAhorro" ADD CONSTRAINT "MetaAhorro_grupoFamiliarId_fkey" FOREIGN KEY ("grupoFamiliarId") REFERENCES "GrupoFamiliar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaAhorro" ADD CONSTRAINT "MetaAhorro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_grupoFamiliarId_fkey" FOREIGN KEY ("grupoFamiliarId") REFERENCES "GrupoFamiliar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_asignadoAUsuarioId_fkey" FOREIGN KEY ("asignadoAUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

