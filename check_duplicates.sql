-- Check for duplicate schedules
SELECT 
    asset_id,
    scheduled_date,
    COUNT(*) as count
FROM maintenance_schedules
WHERE scheduled_date >= '2026-01-01' AND scheduled_date <= '2026-01-31'
GROUP BY asset_id, scheduled_date
HAVING COUNT(*) > 1
ORDER BY scheduled_date, asset_id;
