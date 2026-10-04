DROP INDEX "schedule_date_key";

CREATE UNIQUE INDEX "schedule_active_date_key"
ON "schedule"("date")
WHERE "status" IN ('pendiente'::"ScheduleStatus", 'confirmado'::"ScheduleStatus");
