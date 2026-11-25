-- 25/11/2026 — Booking.com link suspended by the owner: the 5-minute iCal job is paused (definition kept).
-- Expired options are now released by the hourly automations job (/api/public/jobs/automations).
select cron.alter_job(job_id := (select jobid from cron.job where jobname = 'ical-sync-booking'), active := false);

-- To reconnect Booking.com: set BOOKING_COM_LINKED = true in src/lib/ical.ts, then
-- select cron.alter_job(job_id := (select jobid from cron.job where jobname = 'ical-sync-booking'), active := true);
