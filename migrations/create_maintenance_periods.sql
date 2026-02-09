-- =====================================================
-- MAINTENANCE PERIODS TABLE
-- =====================================================
-- This table stores maintenance periods (monthly cycles)
-- Each period represents a month/year combination

CREATE TABLE IF NOT EXISTS maintenance_periods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,                    -- "Januari 2026"
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    total_schedules INTEGER DEFAULT 0,
    completed_schedules INTEGER DEFAULT 0,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure unique month/year combination
    UNIQUE(month, year)
);

-- Add index for faster queries
CREATE INDEX idx_periods_year ON maintenance_periods(year);
CREATE INDEX idx_periods_status ON maintenance_periods(status);
CREATE INDEX idx_periods_month_year ON maintenance_periods(month, year);

-- =====================================================
-- UPDATE MAINTENANCE_SCHEDULES TABLE
-- =====================================================
-- Add period_id foreign key to link schedules to periods

ALTER TABLE maintenance_schedules 
ADD COLUMN IF NOT EXISTS period_id INTEGER REFERENCES maintenance_periods(id) ON DELETE CASCADE;

-- Add index for faster period-based queries
CREATE INDEX IF NOT EXISTS idx_schedules_period ON maintenance_schedules(period_id);

-- =====================================================
-- MIGRATE EXISTING DATA
-- =====================================================
-- Create period for January 2026 (existing data)

INSERT INTO maintenance_periods (name, month, year, status, created_at)
VALUES ('Januari 2026', 1, 2026, 'active', NOW())
ON CONFLICT (month, year) DO NOTHING;

-- Link existing schedules to January 2026 period
UPDATE maintenance_schedules
SET period_id = (
    SELECT id FROM maintenance_periods 
    WHERE month = 1 AND year = 2026
)
WHERE scheduled_date >= '2026-01-01' 
  AND scheduled_date < '2026-02-01'
  AND period_id IS NULL;

-- Update period statistics
UPDATE maintenance_periods p
SET 
    total_schedules = (
        SELECT COUNT(*) 
        FROM maintenance_schedules 
        WHERE period_id = p.id
    ),
    completed_schedules = (
        SELECT COUNT(*) 
        FROM maintenance_schedules 
        WHERE period_id = p.id AND status = 'completed'
    )
WHERE p.month = 1 AND p.year = 2026;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check periods
SELECT * FROM maintenance_periods ORDER BY year DESC, month DESC;

-- Check schedules with period
SELECT 
    ms.id,
    ms.scheduled_date,
    ms.status,
    mp.name as period_name,
    a.name as asset_name
FROM maintenance_schedules ms
LEFT JOIN maintenance_periods mp ON ms.period_id = mp.id
LEFT JOIN assets a ON ms.asset_id = a.id
ORDER BY ms.scheduled_date
LIMIT 10;

-- Period statistics
SELECT 
    name,
    month,
    year,
    status,
    total_schedules,
    completed_schedules,
    CASE 
        WHEN total_schedules > 0 
        THEN ROUND((completed_schedules::NUMERIC / total_schedules) * 100, 2)
        ELSE 0 
    END as completion_percentage
FROM maintenance_periods
ORDER BY year DESC, month DESC;
