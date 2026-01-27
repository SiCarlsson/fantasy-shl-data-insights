-- Migration: Add unique constraint on season_uuid for bronze.shl_game_schedule
-- This prevents duplicate imports of the same season's schedule
-- Date: 2026-01-27

BEGIN;

-- Add unique constraint on season_uuid
ALTER TABLE bronze.shl_game_schedule
ADD CONSTRAINT unique_season_uuid UNIQUE (season_uuid);

COMMIT;
