-- Migration: Update bronze tables to use created_at and updated_at instead of loaded_at
-- This provides better audit tracking for data ingestion
-- Date: 2026-01-27

BEGIN;

-- bronze.shl_game_schedule
ALTER TABLE bronze.shl_game_schedule 
  RENAME COLUMN loaded_at TO created_at;

ALTER TABLE bronze.shl_game_schedule 
  ADD COLUMN updated_at timestamp with time zone DEFAULT NOW();

-- Set initial updated_at to created_at for existing rows
UPDATE bronze.shl_game_schedule 
  SET updated_at = created_at;

-- bronze.shl_team_roster
ALTER TABLE bronze.shl_team_roster 
  RENAME COLUMN loaded_at TO created_at;

ALTER TABLE bronze.shl_team_roster 
  ADD COLUMN updated_at timestamp with time zone DEFAULT NOW();

UPDATE bronze.shl_team_roster 
  SET updated_at = created_at;

-- bronze.shl_team_info
ALTER TABLE bronze.shl_team_info 
  RENAME COLUMN loaded_at TO created_at;

ALTER TABLE bronze.shl_team_info 
  ADD COLUMN updated_at timestamp with time zone DEFAULT NOW();

UPDATE bronze.shl_team_info 
  SET updated_at = created_at;

-- bronze.shl_player_stats
ALTER TABLE bronze.shl_player_stats 
  RENAME COLUMN loaded_at TO created_at;

ALTER TABLE bronze.shl_player_stats 
  ADD COLUMN updated_at timestamp with time zone DEFAULT NOW();

UPDATE bronze.shl_player_stats 
  SET updated_at = created_at;

COMMIT;
