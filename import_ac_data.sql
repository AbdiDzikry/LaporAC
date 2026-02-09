-- ============================================================
-- AC DATA IMPORT SQL SCRIPT
-- PT Dharma Polimetal Tbk - January 2026 Schedule
-- Total AC Units: 113
-- Total Schedules: 113
-- Generated: 2026-02-06T02:56:36.610Z
-- ============================================================

-- Step 1: Delete existing data
-- ============================================================

-- Delete existing tickets (foreign key to assets)
DELETE FROM tickets;

-- Delete existing maintenance schedules
DELETE FROM maintenance_schedules;

-- Delete existing assets
DELETE FROM assets;


-- Step 2: Insert AC Assets
-- ============================================================

INSERT INTO assets (
  name,
  location,
  sku,
  brand,
  pk,
  status,
  purchase_date,
  last_maintenance_date,
  next_maintenance_date,
  maintenance_interval_days,
  is_active,
  useful_life_years,
  residual_value,
  purchase_price
) VALUES
  ('AC AUDITORIUM RA 001', 'AUDITORIUM', 'RA 001', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-16', 90, true, 5, 0, 0),
  ('AC AUDITORIUM RA 002', 'AUDITORIUM', 'RA 002', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-16', 90, true, 5, 0, 0),
  ('AC AUDITORIUM RA 003', 'AUDITORIUM', 'RA 003', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-16', 90, true, 5, 0, 0),
  ('AC AUDITORIUM RA 004', 'AUDITORIUM', 'RA 004', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-16', 90, true, 5, 0, 0),
  ('AC AUDITORIUM RA 005', 'AUDITORIUM', 'RA 005', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-16', 90, true, 5, 0, 0),
  ('AC AUDITORIUM RA 006', 'AUDITORIUM', 'RA 006', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-16', 90, true, 5, 0, 0),
  ('AC AUDITORIUM RA 007', 'AUDITORIUM', 'RA 007', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-16', 90, true, 5, 0, 0),
  ('AC AUDITORIUM RA 008', 'AUDITORIUM', 'RA 008', 'CASSET', '4 PK', 'good', '2024-01-01', NULL, '2026-01-16', 90, true, 5, 0, 0),
  ('AC AUDITORIUM RA 009', 'AUDITORIUM', 'RA 009', 'CASSET', '4 PK', 'good', '2024-01-01', NULL, '2026-01-17', 90, true, 5, 0, 0),
  ('AC AUDITORIUM RA 010', 'AUDITORIUM', 'RA 010', 'CASSET', '4 PK', 'good', '2024-01-01', NULL, '2026-01-17', 90, true, 5, 0, 0),
  ('AC AUDITORIUM RA 011', 'AUDITORIUM', 'RA 011', 'CASSET', '4 PK', 'good', '2024-01-01', NULL, '2026-01-17', 90, true, 5, 0, 0),
  ('AC R. TRAINING RA 014', 'R. TRAINING', 'RA 014', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-17', 90, true, 5, 0, 0),
  ('AC R. TRAINING RA 015', 'R. TRAINING', 'RA 015', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-17', 90, true, 5, 0, 0),
  ('AC R. ARJUNO RA 016', 'R. ARJUNO', 'RA 016', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-17', 90, true, 5, 0, 0),
  ('AC R. MERBABU RA 017', 'R. MERBABU', 'RA 017', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-17', 90, true, 5, 0, 0),
  ('AC R. MERBABU RA 018', 'R. MERBABU', 'RA 018', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-17', 90, true, 5, 0, 0),
  ('AC SEKCOR RA 042', 'SEKCOR', 'RA 042', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-24', 90, true, 5, 0, 0),
  ('AC SEKERTARIS RA 043', 'SEKERTARIS', 'RA 043', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-24', 90, true, 5, 0, 0),
  ('AC DIREKTUR 1 RA 044', 'DIREKTUR 1', 'RA 044', 'CASSET', '2 PK', 'good', '2024-01-01', NULL, '2026-01-24', 90, true, 5, 0, 0),
  ('AC DIREKTUR 2 RA 045', 'DIREKTUR 2', 'RA 045', 'CASSET', '2 PK', 'good', '2024-01-01', NULL, '2026-01-24', 90, true, 5, 0, 0),
  ('AC DIREKTUR 3 RA 046', 'DIREKTUR 3', 'RA 046', 'CASSET', '2 PK', 'good', '2024-01-01', NULL, '2026-01-24', 90, true, 5, 0, 0),
  ('AC DIREKTUR 4 RA 047', 'DIREKTUR 4', 'RA 047', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-24', 90, true, 5, 0, 0),
  ('AC PRESDIR RA048', 'PRESDIR', 'RA048', 'CASSET', '2 PK', 'good', '2024-01-01', NULL, '2026-01-24', 90, true, 5, 0, 0),
  ('AC R. MEETING EXC RA 049', 'R. MEETING EXC', 'RA 049', 'CASSET', '3 PK', 'good', '2024-01-01', NULL, '2026-01-24', 90, true, 5, 0, 0),
  ('AC R. MEETING EXC RA 050', 'R. MEETING EXC', 'RA 050', 'CASSET', '3 PK', 'good', '2024-01-01', NULL, '2026-01-24', 90, true, 5, 0, 0),
  ('AC R. MEETING EXC RA 051', 'R. MEETING EXC', 'RA 051', 'CASSET', '3 PK', 'good', '2024-01-01', NULL, '2026-01-24', 90, true, 5, 0, 0),
  ('AC R. SPSI RB002', 'R. SPSI', 'RB002', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-28', 90, true, 5, 0, 0),
  ('AC R. KLINIK RB003', 'R. KLINIK', 'RB003', 'CASSET', '2 PK', 'good', '2024-01-01', NULL, '2026-01-28', 90, true, 5, 0, 0),
  ('AC R. KERINCI RB004', 'R. KERINCI', 'RB004', 'CASSET', '2 PK', 'good', '2024-01-01', NULL, '2026-01-28', 90, true, 5, 0, 0),
  ('AC R. LAKTASI RB005', 'R. LAKTASI', 'RB005', 'CASSET', '2 PK', 'good', '2024-01-01', NULL, '2026-01-28', 90, true, 5, 0, 0),
  ('AC R. KELUD RB006', 'R. KELUD', 'RB006', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-28', 90, true, 5, 0, 0),
  ('AC R. PAPANDAYAN RB007', 'R. PAPANDAYAN', 'RB007', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-28', 90, true, 5, 0, 0),
  ('AC R. GYM RB008', 'R. GYM', 'RB008', 'CASSET', '3 PK', 'good', '2024-01-01', NULL, '2026-01-28', 90, true, 5, 0, 0),
  ('AC R. PERSONALIA RB009', 'R. PERSONALIA', 'RB009', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-28', 90, true, 5, 0, 0),
  ('AC R. INVOICE RB010', 'R. INVOICE', 'RB010', 'SPLITE', '1,5', 'good', '2024-01-01', NULL, '2026-01-13', 90, true, 5, 0, 0),
  ('AC LOBBY UTAMA RB011', 'LOBBY UTAMA', 'RB011', 'CASSET', '3 PK', 'good', '2024-01-01', NULL, '2026-01-13', 90, true, 5, 0, 0),
  ('AC R. RINJANI RB012', 'R. RINJANI', 'RB012', 'CASSET', '2 PK', 'good', '2024-01-01', NULL, '2026-01-13', 90, true, 5, 0, 0),
  ('AC R. SEMERU RB013', 'R. SEMERU', 'RB013', 'CASSET', '2 PK', 'good', '2024-01-01', NULL, '2026-01-13', 90, true, 5, 0, 0),
  ('AC R. SEMERU RB014', 'R. SEMERU', 'RB014', 'CASSET', '2 PK', 'good', '2024-01-01', NULL, '2026-01-13', 90, true, 5, 0, 0),
  ('AC R. MERAPI RB021', 'R. MERAPI', 'RB021', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-13', 90, true, 5, 0, 0),
  ('AC R. CEREMAI RB022', 'R. CEREMAI', 'RB022', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-13', 90, true, 5, 0, 0),
  ('AC R. GALUNGGUNG RB023', 'R. GALUNGGUNG', 'RB023', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-13', 90, true, 5, 0, 0),
  ('AC R. GUDANG PURCH RB024', 'R. GUDANG PURCH', 'RB024', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-15', 90, true, 5, 0, 0),
  ('AC POS 2 RB025', 'POS 2', 'RB025', 'SPLITE', '1.5 PK', 'good', '2024-01-01', NULL, '2026-01-15', 90, true, 5, 0, 0),
  ('AC MAINTENANCE GB001', 'MAINTENANCE', 'GB001', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-15', 90, true, 5, 0, 0),
  ('AC MAINTENANCE GB002', 'MAINTENANCE', 'GB002', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-15', 90, true, 5, 0, 0),
  ('AC ASSET MANAGEMENT GB003', 'ASSET MANAGEMENT', 'GB003', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-15', 90, true, 5, 0, 0),
  ('AC GUDANG ATK GB004', 'GUDANG ATK', 'GB004', 'SPLITE', '1,5 PK', 'good', '2024-01-01', NULL, '2026-01-15', 90, true, 5, 0, 0),
  ('AC DOJO GB005', 'DOJO', 'GB005', 'CASSET', '2 PK', 'good', '2024-01-01', NULL, '2026-01-15', 90, true, 5, 0, 0),
  ('AC DOJO GB006', 'DOJO', 'GB006', 'CASSET', '2 PK', 'good', '2024-01-01', NULL, '2026-01-15', 90, true, 5, 0, 0),
  ('AC DOJO GB007', 'DOJO', 'GB007', 'SPLITE', '1,5 PK', 'good', '2024-01-01', NULL, '2026-01-20', 90, true, 5, 0, 0),
  ('AC DOJO GB008', 'DOJO', 'GB008', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-20', 90, true, 5, 0, 0),
  ('AC KOPERASI GB009', 'KOPERASI', 'GB009', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-20', 90, true, 5, 0, 0),
  ('AC KOPERASI GB010', 'KOPERASI', 'GB010', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-20', 90, true, 5, 0, 0),
  ('AC MANUFACTUR GB011', 'MANUFACTUR', 'GB011', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-20', 90, true, 5, 0, 0),
  ('AC MANUFACTUR GB012', 'MANUFACTUR', 'GB012', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-20', 90, true, 5, 0, 0),
  ('AC MANUFACTUR GB013', 'MANUFACTUR', 'GB013', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-20', 90, true, 5, 0, 0),
  ('AC MANUFACTUR GB014', 'MANUFACTUR', 'GB014', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-20', 90, true, 5, 0, 0),
  ('AC R. QA GB015', 'R. QA', 'GB015', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-22', 90, true, 5, 0, 0),
  ('AC R. QA GB016', 'R. QA', 'GB016', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-22', 90, true, 5, 0, 0),
  ('AC R. QA GB017', 'R. QA', 'GB017', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-22', 90, true, 5, 0, 0),
  ('AC R. QA GB018', 'R. QA', 'GB018', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-22', 90, true, 5, 0, 0),
  ('AC R. LAB METALURGI GB025', 'R. LAB METALURGI', 'GB025', 'SPLITE', '1,5 PK', 'good', '2024-01-01', NULL, '2026-01-22', 90, true, 5, 0, 0),
  ('AC R. LAB METALURGI GB026', 'R. LAB METALURGI', 'GB026', 'SPLITE', '1,5 PK', 'good', '2024-01-01', NULL, '2026-01-22', 90, true, 5, 0, 0),
  ('AC R. ENG 2W GB028', 'R. ENG 2W', 'GB028', 'SPLITE', '1,5 PK', 'good', '2024-01-01', NULL, '2026-01-22', 90, true, 5, 0, 0),
  ('AC R. ENG 2W GB031', 'R. ENG 2W', 'GB031', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-22', 90, true, 5, 0, 0),
  ('AC R. ENG 2W GB032', 'R. ENG 2W', 'GB032', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-27', 90, true, 5, 0, 0),
  ('AC OFFICE 4W GB034', 'OFFICE 4W', 'GB034', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-27', 90, true, 5, 0, 0),
  ('AC OFFICE 4W GB035', 'OFFICE 4W', 'GB035', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-27', 90, true, 5, 0, 0),
  ('AC OFFICE 4 W GB036', 'OFFICE 4 W', 'GB036', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-27', 90, true, 5, 0, 0),
  ('AC DOJO MTC GB038', 'DOJO MTC', 'GB038', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-27', 90, true, 5, 0, 0),
  ('AC DOJO GB039', 'DOJO', 'GB039', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-27', 90, true, 5, 0, 0),
  ('AC OFFICE QUALITY BARU GB040', 'OFFICE QUALITY BARU', 'GB040', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-27', 90, true, 5, 0, 0),
  ('AC OFFICE QUALITY BARU GB041', 'OFFICE QUALITY BARU', 'GB041', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-27', 90, true, 5, 0, 0),
  ('AC OFFICE QUALITY BARU GB042', 'OFFICE QUALITY BARU', 'GB042', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-29', 90, true, 5, 0, 0),
  ('AC OFFICE QUALITY BARU GB043', 'OFFICE QUALITY BARU', 'GB043', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-29', 90, true, 5, 0, 0),
  ('AC R. CHEMICAL ( CED ) GC007', 'R. CHEMICAL ( CED )', 'GC007', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-29', 90, true, 5, 0, 0),
  ('AC R. INCOMING ( CED ) GC008', 'R. INCOMING ( CED )', 'GC008', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-29', 90, true, 5, 0, 0),
  ('AC KOPERASI GEDUNG BARU GC011', 'KOPERASI GEDUNG BARU', 'GC011', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-29', 90, true, 5, 0, 0),
  ('AC R. OBEYA ( ENG 4W ) GD002', 'R. OBEYA ( ENG 4W )', 'GD002', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-29', 90, true, 5, 0, 0),
  ('AC SERVER ENG 4W GD003', 'SERVER ENG 4W', 'GD003', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-29', 90, true, 5, 0, 0),
  ('AC R. OBEYA ( ENG 4W ) GD004', 'R. OBEYA ( ENG 4W )', 'GD004', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-29', 90, true, 5, 0, 0),
  ('AC R. OFFICE ENG 4W GD005', 'R. OFFICE ENG 4W', 'GD005', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-09', 90, true, 5, 0, 0),
  ('AC DESIGN ENG 4W GD006', 'DESIGN ENG 4W', 'GD006', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-09', 90, true, 5, 0, 0),
  ('AC PP MEMBER ENG 4W GD007', 'PP MEMBER ENG 4W', 'GD007', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-09', 90, true, 5, 0, 0),
  ('AC R. ENG 4W GD011', 'R. ENG 4W', 'GD011', 'SPLITE', '1,5 PK', 'good', '2024-01-01', NULL, '2026-01-09', 90, true, 5, 0, 0),
  ('AC R. ENG 4W GD012', 'R. ENG 4W', 'GD012', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-09', 90, true, 5, 0, 0),
  ('AC R. ENG 4W GD013', 'R. ENG 4W', 'GD013', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-09', 90, true, 5, 0, 0),
  ('AC R. ENG 4W GD014', 'R. ENG 4W', 'GD014', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-09', 90, true, 5, 0, 0),
  ('AC R. PE FAST GD015', 'R. PE FAST', 'GD015', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-09', 90, true, 5, 0, 0),
  ('AC R. OFFICE FAST DOKING GD017', 'R. OFFICE FAST DOKING', 'GD017', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-14', 90, true, 5, 0, 0),
  ('AC R. OFFICE FAST DOKING GD018', 'R. OFFICE FAST DOKING', 'GD018', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-14', 90, true, 5, 0, 0),
  ('AC R. OFFICE FAST DOKING GD019', 'R. OFFICE FAST DOKING', 'GD019', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-14', 90, true, 5, 0, 0),
  ('AC R. OFFICE FAST DOKING GD020', 'R. OFFICE FAST DOKING', 'GD020', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-14', 90, true, 5, 0, 0),
  ('AC R. PANEL CHILLER BATRE PAC GD030', 'R. PANEL CHILLER BATRE PAC', 'GD030', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-14', 90, true, 5, 0, 0),
  ('AC PENDINGIN DUCTING HT 01 GD031', 'PENDINGIN DUCTING HT 01', 'GD031', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-14', 90, true, 5, 0, 0),
  ('AC R. OFFICE AZP GE001', 'R. OFFICE AZP', 'GE001', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-07', 90, true, 5, 0, 0),
  ('AC R. OFFICE AZP GE002', 'R. OFFICE AZP', 'GE002', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-07', 90, true, 5, 0, 0),
  ('AC PANEL AZP GE003', 'PANEL AZP', 'GE003', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-07', 90, true, 5, 0, 0),
  ('AC OFFICE LAB AZP GE004', 'OFFICE LAB AZP', 'GE004', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-07', 90, true, 5, 0, 0),
  ('AC OFFICE AZP GE005', 'OFFICE AZP', 'GE005', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-07', 90, true, 5, 0, 0),
  ('AC OFFICE HYUNDAI GF001', 'OFFICE HYUNDAI', 'GF001', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-07', 90, true, 5, 0, 0),
  ('AC OFFICE HYUNDAI GF002', 'OFFICE HYUNDAI', 'GF002', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-07', 90, true, 5, 0, 0),
  ('AC OFFICE HYUNDAI GF003', 'OFFICE HYUNDAI', 'GF003', 'SPLITE', '1 PK', 'good', '2024-01-01', NULL, '2026-01-07', 90, true, 5, 0, 0),
  ('AC OFFICE D 03 GG001', 'OFFICE D 03', 'GG001', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-14', 90, true, 5, 0, 0),
  ('AC OFFICE D 03 GG002', 'OFFICE D 03', 'GG002', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-14', 90, true, 5, 0, 0),
  ('AC OFFICE ATAS 3W001', 'OFFICE ATAS', '3W001', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-19', 90, true, 5, 0, 0),
  ('AC OFFICE ATAS 3W002', 'OFFICE ATAS', '3W002', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-19', 90, true, 5, 0, 0),
  ('AC OFFICE ATAS 3W003', 'OFFICE ATAS', '3W003', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-19', 90, true, 5, 0, 0),
  ('AC OFFICE ATAS 3W004', 'OFFICE ATAS', '3W004', 'SPLITE', '2 PK', 'good', '2024-01-01', NULL, '2026-01-19', 90, true, 5, 0, 0),
  ('AC GEDUNG C AICOOL1', 'GEDUNG C', 'AICOOL1', 'CHILLER', '15 PK', 'good', '2024-01-01', NULL, '2026-01-19', 90, true, 5, 0, 0),
  ('AC GEDUNG C AICOOL2', 'GEDUNG C', 'AICOOL2', 'CHILLER', '15 PK', 'good', '2024-01-01', NULL, '2026-01-19', 90, true, 5, 0, 0),
  ('AC GEDUNG C AICOOL3', 'GEDUNG C', 'AICOOL3', 'CHILLER', '15 PK', 'good', '2024-01-01', NULL, '2026-01-19', 90, true, 5, 0, 0);

-- Step 3: Insert Maintenance Schedules
-- ============================================================

INSERT INTO maintenance_schedules (
  asset_id,
  scheduled_date,
  status,
  notes
)
SELECT 
  a.id,
  s.scheduled_date::date,
  'scheduled',
  'Imported from CSV - January 2026 Schedule'
FROM (VALUES
  ('RA 001', '2026-01-16'),
  ('RA 002', '2026-01-16'),
  ('RA 003', '2026-01-16'),
  ('RA 004', '2026-01-16'),
  ('RA 005', '2026-01-16'),
  ('RA 006', '2026-01-16'),
  ('RA 007', '2026-01-16'),
  ('RA 008', '2026-01-16'),
  ('RA 009', '2026-01-17'),
  ('RA 010', '2026-01-17'),
  ('RA 011', '2026-01-17'),
  ('RA 014', '2026-01-17'),
  ('RA 015', '2026-01-17'),
  ('RA 016', '2026-01-17'),
  ('RA 017', '2026-01-17'),
  ('RA 018', '2026-01-17'),
  ('RA 042', '2026-01-24'),
  ('RA 043', '2026-01-24'),
  ('RA 044', '2026-01-24'),
  ('RA 045', '2026-01-24'),
  ('RA 046', '2026-01-24'),
  ('RA 047', '2026-01-24'),
  ('RA048', '2026-01-24'),
  ('RA 049', '2026-01-24'),
  ('RA 050', '2026-01-24'),
  ('RA 051', '2026-01-24'),
  ('RB002', '2026-01-28'),
  ('RB003', '2026-01-28'),
  ('RB004', '2026-01-28'),
  ('RB005', '2026-01-28'),
  ('RB006', '2026-01-28'),
  ('RB007', '2026-01-28'),
  ('RB008', '2026-01-28'),
  ('RB009', '2026-01-28'),
  ('RB010', '2026-01-13'),
  ('RB011', '2026-01-13'),
  ('RB012', '2026-01-13'),
  ('RB013', '2026-01-13'),
  ('RB014', '2026-01-13'),
  ('RB021', '2026-01-13'),
  ('RB022', '2026-01-13'),
  ('RB023', '2026-01-13'),
  ('RB024', '2026-01-15'),
  ('RB025', '2026-01-15'),
  ('GB001', '2026-01-15'),
  ('GB002', '2026-01-15'),
  ('GB003', '2026-01-15'),
  ('GB004', '2026-01-15'),
  ('GB005', '2026-01-15'),
  ('GB006', '2026-01-15'),
  ('GB007', '2026-01-20'),
  ('GB008', '2026-01-20'),
  ('GB009', '2026-01-20'),
  ('GB010', '2026-01-20'),
  ('GB011', '2026-01-20'),
  ('GB012', '2026-01-20'),
  ('GB013', '2026-01-20'),
  ('GB014', '2026-01-20'),
  ('GB015', '2026-01-22'),
  ('GB016', '2026-01-22'),
  ('GB017', '2026-01-22'),
  ('GB018', '2026-01-22'),
  ('GB025', '2026-01-22'),
  ('GB026', '2026-01-22'),
  ('GB028', '2026-01-22'),
  ('GB031', '2026-01-22'),
  ('GB032', '2026-01-27'),
  ('GB034', '2026-01-27'),
  ('GB035', '2026-01-27'),
  ('GB036', '2026-01-27'),
  ('GB038', '2026-01-27'),
  ('GB039', '2026-01-27'),
  ('GB040', '2026-01-27'),
  ('GB041', '2026-01-27'),
  ('GB042', '2026-01-29'),
  ('GB043', '2026-01-29'),
  ('GC007', '2026-01-29'),
  ('GC008', '2026-01-29'),
  ('GC011', '2026-01-29'),
  ('GD002', '2026-01-29'),
  ('GD003', '2026-01-29'),
  ('GD004', '2026-01-29'),
  ('GD005', '2026-01-09'),
  ('GD006', '2026-01-09'),
  ('GD007', '2026-01-09'),
  ('GD011', '2026-01-09'),
  ('GD012', '2026-01-09'),
  ('GD013', '2026-01-09'),
  ('GD014', '2026-01-09'),
  ('GD015', '2026-01-09'),
  ('GD017', '2026-01-14'),
  ('GD018', '2026-01-14'),
  ('GD019', '2026-01-14'),
  ('GD020', '2026-01-14'),
  ('GD030', '2026-01-14'),
  ('GD031', '2026-01-14'),
  ('GE001', '2026-01-07'),
  ('GE002', '2026-01-07'),
  ('GE003', '2026-01-07'),
  ('GE004', '2026-01-07'),
  ('GE005', '2026-01-07'),
  ('GF001', '2026-01-07'),
  ('GF002', '2026-01-07'),
  ('GF003', '2026-01-07'),
  ('GG001', '2026-01-14'),
  ('GG002', '2026-01-14'),
  ('3W001', '2026-01-19'),
  ('3W002', '2026-01-19'),
  ('3W003', '2026-01-19'),
  ('3W004', '2026-01-19'),
  ('AICOOL1', '2026-01-19'),
  ('AICOOL2', '2026-01-19'),
  ('AICOOL3', '2026-01-19')
) AS s(sku, scheduled_date)
JOIN assets a ON a.sku = s.sku;


-- Step 4: Verification Queries
-- ============================================================

-- Check total assets
SELECT COUNT(*) AS total_assets FROM assets;
-- Expected: 113

-- Check total schedules
SELECT COUNT(*) AS total_schedules FROM maintenance_schedules WHERE status = 'scheduled';
-- Expected: 113

-- Check schedule distribution by date
SELECT 
  scheduled_date,
  COUNT(*) AS ac_count
FROM maintenance_schedules
WHERE status = 'scheduled'
GROUP BY scheduled_date
ORDER BY scheduled_date;

-- Sample assets
SELECT id, name, sku, brand, pk, location, next_maintenance_date
FROM assets
ORDER BY sku
LIMIT 10;

-- ============================================================
-- END OF SCRIPT
-- ============================================================
