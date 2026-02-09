-- Clean and Re-seed January 2026 Maintenance Data
BEGIN;

-- 1. Delete existing January 2026 schedules
DELETE FROM public.maintenance_schedules 
WHERE scheduled_date >= '2026-01-01' AND scheduled_date <= '2026-01-31';

COMMIT;
