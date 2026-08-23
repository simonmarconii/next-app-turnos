-- CreateEnum
CREATE TYPE "PaymentMethods" AS ENUM ('tarjeta', 'transferencia');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pendiente', 'aprobado', 'rechazado', 'cancelado');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('pendiente_pago', 'confirmado', 'cancelado', 'completado');

-- CreateTable
CREATE TABLE "schedule" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMP(6) NOT NULL,
    "service_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" "ScheduleStatus" NOT NULL DEFAULT 'pendiente_pago',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_in" TIMESTAMPTZ(6),

    CONSTRAINT "schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR NOT NULL,
    "price" REAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR NOT NULL,
    "lastname" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "phone" VARCHAR NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "schedule_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "amount" REAL NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pendiente',
    "payment_method" VARCHAR,
    "external_payment_id" UUID DEFAULT gen_random_uuid(),

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_name_key" ON "service"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "payment_schedule_id_key" ON "payment"("schedule_id");

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
