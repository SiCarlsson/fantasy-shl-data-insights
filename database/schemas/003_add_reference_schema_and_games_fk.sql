-- =============================================================================
-- Fantasy SHL Data Insights - Add Reference Schema and Update Silver Games
-- =============================================================================
-- Description: Creates reference schema for metadata (seasons, series, game types)
--              and updates silver.shl_games with foreign keys to reference tables
-- Author: Simon Carlsson
-- Created: 2026-01-27
-- Database: fantasy_sports_db
--
-- Changes:
-- - Create reference schema
-- - Add reference.seasons table
-- - Add reference.series table
-- - Add reference.game_types table
-- - Update silver.shl_games with season_uuid, series_uuid, game_type_uuid columns
-- - Add foreign key constraints from silver.shl_games to reference tables
-- =============================================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS reference;

CREATE TABLE IF NOT EXISTS reference.seasons
(
    season_id serial,
    season_uuid character varying(50) NOT NULL,
    code character varying(15) NOT NULL,
    name character varying(50) NOT NULL,
    is_current boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT NOW(),
    PRIMARY KEY (season_id),
    UNIQUE (season_uuid)
);

CREATE TABLE IF NOT EXISTS reference.game_types
(
    game_type_id serial,
    game_type_uuid character varying(50) NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    PRIMARY KEY (game_type_id),
    UNIQUE (game_type_uuid)
);

CREATE TABLE IF NOT EXISTS reference.series
(
    series_id serial,
    series_uuid character varying(50) NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    PRIMARY KEY (series_id),
    UNIQUE (series_uuid)
);

-- Add reference columns to silver.shl_games (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'silver' 
                   AND table_name = 'shl_games' 
                   AND column_name = 'season_uuid') THEN
        ALTER TABLE silver.shl_games ADD COLUMN season_uuid character varying(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'silver' 
                   AND table_name = 'shl_games' 
                   AND column_name = 'series_uuid') THEN
        ALTER TABLE silver.shl_games ADD COLUMN series_uuid character varying(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'silver' 
                   AND table_name = 'shl_games' 
                   AND column_name = 'game_type_uuid') THEN
        ALTER TABLE silver.shl_games ADD COLUMN game_type_uuid character varying(50);
    END IF;
END $$;

-- Add foreign key constraints
ALTER TABLE IF EXISTS silver.shl_games
    DROP CONSTRAINT IF EXISTS "Season uuid";
    
ALTER TABLE IF EXISTS silver.shl_games
    ADD CONSTRAINT "Season uuid" FOREIGN KEY (season_uuid)
    REFERENCES reference.seasons (season_uuid) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS silver.shl_games
    DROP CONSTRAINT IF EXISTS "Series uuid";

ALTER TABLE IF EXISTS silver.shl_games
    ADD CONSTRAINT "Series uuid" FOREIGN KEY (series_uuid)
    REFERENCES reference.series (series_uuid) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS silver.shl_games
    DROP CONSTRAINT IF EXISTS "Game type uuid";

ALTER TABLE IF EXISTS silver.shl_games
    ADD CONSTRAINT "Game type uuid" FOREIGN KEY (game_type_uuid)
    REFERENCES reference.game_types (game_type_uuid) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

-- Create index on is_current for quick lookups
CREATE INDEX IF NOT EXISTS idx_seasons_is_current ON reference.seasons(is_current) WHERE is_current = true;

END;
