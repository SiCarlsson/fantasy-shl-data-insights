-- Migration: Add updated_at columns to reference tables
-- Date: 2025-01-27

BEGIN;

-- Add updated_at to reference.seasons
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'reference' 
        AND table_name = 'seasons' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE reference.seasons 
        ADD COLUMN updated_at timestamp with time zone DEFAULT NOW();
    END IF;
END $$;

-- Add updated_at to reference.game_types
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'reference' 
        AND table_name = 'game_types' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE reference.game_types 
        ADD COLUMN updated_at timestamp with time zone DEFAULT NOW();
    END IF;
END $$;

-- Add updated_at to reference.series
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'reference' 
        AND table_name = 'series' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE reference.series 
        ADD COLUMN updated_at timestamp with time zone DEFAULT NOW();
    END IF;
END $$;

COMMIT;
