-- Migration: Update tickets table for Maker-Checker Process
-- 1. Add new columns for tracking assignment and verification
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS technician_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;

-- 2. Update the status check constraint to support new workflow
-- We have to drop the old constraint first. 
-- Note: Constraint names might vary, so we try to drop the common default one or specific if known.
-- If the constraint was created inline, it usually has a generated name. 
-- For safety, we will just alter functionality by allowing the new values without explicit constraint drop if possible, 
-- but Postgres ENUMs or Constraints need care.
-- Assuming 'status' is a TEXT column with a CHECK constraint (based on previous files not showing CREATE TYPE enum).

ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;

ALTER TABLE tickets
ADD CONSTRAINT tickets_status_check 
CHECK (status IN ('open', 'assigned', 'in_progress', 'pending_verification', 'resolved', 'closed', 'cancelled'));

-- 3. Create a function to auto-update 'updated_at' if not exists (Standard)
-- (Already exists usually, jumping to next step)

-- 4. Policy updates (if any)
-- Ensure 'technicians' can view assigned tickets.
-- This requires RLS updates which we will handle separately if blocking.
