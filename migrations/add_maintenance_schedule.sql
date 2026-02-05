-- Add next_maintenance_date column to assets table
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS next_maintenance_date DATE;

COMMENT ON COLUMN assets.next_maintenance_date IS 'Next scheduled maintenance date';

-- Example: Set maintenance dates based on CSV data for January 2026
-- AUDITORIUM ACs (RA 001-007) - maintenance on Jan 16, 2026
UPDATE assets SET next_maintenance_date = '2026-01-16' WHERE sku IN ('RA001', 'RA002', 'RA003', 'RA004', 'RA005', 'RA006', 'RA007', 'RA008');

-- AUDITORIUM ACs (RA 009-011) - maintenance on Jan 17, 2026
UPDATE assets SET next_maintenance_date = '2026-01-17' WHERE sku IN ('RA009', 'RA010', 'RA011');

-- R. TRAINING (RA 014-015) - maintenance on Jan 17, 2026
UPDATE assets SET next_maintenance_date = '2026-01-17' WHERE sku IN ('RA014', 'RA015');

-- R. ARJUNO & MERBABU (RA 016-018) - maintenance on Jan 17, 2026
UPDATE assets SET next_maintenance_date = '2026-01-17' WHERE sku IN ('RA016', 'RA017', 'RA018');

-- SEKCOR, SEKERTARIS, DIREKTUR (RA 042-047) - maintenance on Jan 24, 2026
UPDATE assets SET next_maintenance_date = '2026-01-24' WHERE sku IN ('RA042', 'RA043', 'RA044', 'RA045', 'RA046', 'RA047');

-- PRESDIR & R. MEETING EXC (RA048-051) - maintenance on Jan 24, 2026
UPDATE assets SET next_maintenance_date = '2026-01-24' WHERE sku IN ('RA048', 'RA049', 'RA050', 'RA051');

-- R. SPSI, KLINIK, KERINCI, LAKTASI (RB002-005) - maintenance on Jan 28, 2026
UPDATE assets SET next_maintenance_date = '2026-01-28' WHERE sku IN ('RB002', 'RB003', 'RB004', 'RB005');

-- R. KELUD, PAPANDAYAN, GYM, PERSONALIA (RB006-009) - maintenance on Jan 28, 2026
UPDATE assets SET next_maintenance_date = '2026-01-28' WHERE sku IN ('RB006', 'RB007', 'RB008', 'RB009');

-- R. INVOICE, LOBBY UTAMA, RINJANI, SEMERU (RB010-014) - maintenance on Jan 12, 2026
UPDATE assets SET next_maintenance_date = '2026-01-12' WHERE sku IN ('RB010', 'RB011', 'RB012', 'RB013', 'RB014');

-- R. MERAPI, CEREMAI, GALUNGGUNG (RB021-023) - maintenance on Jan 12, 2026
UPDATE assets SET next_maintenance_date = '2026-01-12' WHERE sku IN ('RB021', 'RB022', 'RB023');

-- R. GUDANG PURCH, POS 2 (RB024-025) - maintenance on Jan 14, 2026
UPDATE assets SET next_maintenance_date = '2026-01-14' WHERE sku IN ('RB024', 'RB025');

-- MAINTENANCE, ASSET MANAGEMENT, GUDANG ATK (GB001-004) - maintenance on Jan 14, 2026
UPDATE assets SET next_maintenance_date = '2026-01-14' WHERE sku IN ('GB001', 'GB002', 'GB003', 'GB004');

-- DOJO (GB005-006) - maintenance on Jan 14, 2026
UPDATE assets SET next_maintenance_date = '2026-01-14' WHERE sku IN ('GB005', 'GB006');

-- DOJO, KOPERASI, MANUFACTUR (GB007-014) - maintenance on Jan 19, 2026
UPDATE assets SET next_maintenance_date = '2026-01-19' WHERE sku IN ('GB007', 'GB008', 'GB009', 'GB010', 'GB011', 'GB012', 'GB013', 'GB014');

-- R. QA (GB015-018) - maintenance on Jan 21, 2026
UPDATE assets SET next_maintenance_date = '2026-01-21' WHERE sku IN ('GB015', 'GB016', 'GB017', 'GB018');

-- R. LAB METALURGI, ENG 2W (GB025-032) - maintenance on Jan 21, 2026
UPDATE assets SET next_maintenance_date = '2026-01-21' WHERE sku IN ('GB025', 'GB026', 'GB028', 'GB031');

-- R. ENG 2W, OFFICE 4W, DOJO MTC (GB032-039) - maintenance on Jan 28, 2026
UPDATE assets SET next_maintenance_date = '2026-01-28' WHERE sku IN ('GB032', 'GB034', 'GB035', 'GB036', 'GB038', 'GB039');

-- OFFICE QUALITY BARU (GB040-043) - maintenance on Jan 28 & 30, 2026
UPDATE assets SET next_maintenance_date = '2026-01-28' WHERE sku IN ('GB040', 'GB041');
UPDATE assets SET next_maintenance_date = '2026-01-30' WHERE sku IN ('GB042', 'GB043');

-- R. CHEMICAL, INCOMING, KOPERASI GEDUNG BARU (GC007-011) - maintenance on Jan 30, 2026
UPDATE assets SET next_maintenance_date = '2026-01-30' WHERE sku IN ('GC007', 'GC008', 'GC011');

-- R. OBEYA, SERVER, OFFICE ENG 4W (GD002-007) - maintenance on Jan 30 & 9, 2026
UPDATE assets SET next_maintenance_date = '2026-01-30' WHERE sku IN ('GD002', 'GD003', 'GD004');
UPDATE assets SET next_maintenance_date = '2026-01-09' WHERE sku IN ('GD005', 'GD006', 'GD007');

-- R. ENG 4W, PE FAST (GD011-015) - maintenance on Jan 9, 2026
UPDATE assets SET next_maintenance_date = '2026-01-09' WHERE sku IN ('GD011', 'GD012', 'GD013', 'GD014', 'GD015');

-- R. OFFICE FAST DOKING (GD017-020) - maintenance on Jan 13, 2026
UPDATE assets SET next_maintenance_date = '2026-01-13' WHERE sku IN ('GD017', 'GD018', 'GD019', 'GD020');

-- R. PANEL CHILLER, PENDINGIN DUCTING (GD030-031) - maintenance on Jan 13, 2026
UPDATE assets SET next_maintenance_date = '2026-01-13' WHERE sku IN ('GD030', 'GD031');

-- R. OFFICE AZP, PANEL AZP, OFFICE LAB AZP (GE001-005) - maintenance on Jan 7, 2026
UPDATE assets SET next_maintenance_date = '2026-01-07' WHERE sku IN ('GE001', 'GE002', 'GE003', 'GE004', 'GE005');

-- OFFICE HYUNDAI (GF001-003) - maintenance on Jan 7, 2026
UPDATE assets SET next_maintenance_date = '2026-01-07' WHERE sku IN ('GF001', 'GF002', 'GF003');

-- OFFICE D 03 (GG001-002) - maintenance on Jan 13, 2026
UPDATE assets SET next_maintenance_date = '2026-01-13' WHERE sku IN ('GG001', 'GG002');

-- OFFICE ATAS (3W001-004) - maintenance on Jan 17, 2026
UPDATE assets SET next_maintenance_date = '2026-01-17' WHERE sku IN ('3W001', '3W002', '3W003', '3W004');

-- GEDUNG C AICOOL (AICOOL1-3) - maintenance on Jan 17, 2026
UPDATE assets SET next_maintenance_date = '2026-01-17' WHERE sku IN ('AICOOL1', 'AICOOL2', 'AICOOL3');
