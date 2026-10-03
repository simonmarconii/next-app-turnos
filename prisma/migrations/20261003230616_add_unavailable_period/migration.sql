-- CreateTable
CREATE TABLE "unavailable_period" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "reason" VARCHAR,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unavailable_period_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "unavailable_period_start_date_end_date_idx" ON "unavailable_period"("start_date", "end_date");
