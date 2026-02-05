-- Migration: Update Ticket Status for GA Validation Workflow

BEGIN;

-- 1. Update existing 'open' tickets to 'pending_validation' if they are new (optional, but let's assume we start fresh or keep old ones as open)
-- UPDATE public.tickets SET status = 'pending_validation' WHERE status = 'open';

-- 2. Add Check Constraint for Statuses
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_status_check;

ALTER TABLE public.tickets
ADD CONSTRAINT tickets_status_check 
CHECK (status IN ('pending_validation', 'open', 'in_progress', 'resolved', 'closed', 'false_alarm'));

-- 3. Set Default Status to 'pending_validation'
ALTER TABLE public.tickets ALTER COLUMN status SET DEFAULT 'pending_validation';

COMMIT;
