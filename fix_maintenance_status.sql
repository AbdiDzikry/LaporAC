-- Fix Maintenance Schedule Status Check Constraint
-- The UI uses 'scheduled' but the DB originally had 'pending'.
-- We need to update the constraint to allow 'scheduled' and update existing 'pending' records if any.

BEGIN;

-- 1. Drop the existing constraint
ALTER TABLE public.maintenance_schedules 
DROP CONSTRAINT IF EXISTS maintenance_schedules_status_check;

-- 2. Update any existing 'pending' records to 'scheduled' (optional, for consistency)
UPDATE public.maintenance_schedules 
SET status = 'scheduled' 
WHERE status = 'pending';

-- 3. Add the new constraint with 'scheduled'
ALTER TABLE public.maintenance_schedules 
ADD CONSTRAINT maintenance_schedules_status_check 
CHECK (status IN ('scheduled', 'pending', 'in_progress', 'completed', 'missed'));

-- 4. Update the default value
ALTER TABLE public.maintenance_schedules 
ALTER COLUMN status SET DEFAULT 'scheduled';

COMMIT;
