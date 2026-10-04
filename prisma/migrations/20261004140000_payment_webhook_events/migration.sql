CREATE TABLE "payment_webhook_event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_key" VARCHAR NOT NULL,
    "external_payment_id" VARCHAR NOT NULL,
    "action" VARCHAR,
    "email_sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_webhook_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_webhook_event_event_key_key"
ON "payment_webhook_event"("event_key");
