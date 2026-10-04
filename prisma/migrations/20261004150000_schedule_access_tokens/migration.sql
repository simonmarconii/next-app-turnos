ALTER TABLE "schedule"
ADD COLUMN "access_token_hash" VARCHAR,
ADD COLUMN "access_token_expires_at" TIMESTAMPTZ(6);

CREATE UNIQUE INDEX "schedule_access_token_hash_key"
ON "schedule"("access_token_hash");
