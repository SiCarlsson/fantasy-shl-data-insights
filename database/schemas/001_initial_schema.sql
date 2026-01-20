-- =============================================================================
-- Fantasy SHL Data Insights - Initial Database Schema
-- =============================================================================
-- Description: Creates Bronze and Silver layer tables for SHL hockey data
-- Author: Simon Carlsson
-- Created: 2026-01-21
-- Database: fantasy_sports_db
--
-- Bronze Layer: Raw JSONB data from SHL API
-- Silver Layer: Cleaned, typed data with SCD Type 2 for player history
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS silver.shl_teams
(
    team_id serial,
    team_uuid character varying(50) NOT NULL,
    full_name character varying(40) NOT NULL,
    long_name character varying(40) NOT NULL,
    short_name character varying(20) NOT NULL,
    code character varying(4) NOT NULL,
    icon_url text,
    is_active boolean NOT NULL DEFAULT TRUE,
    PRIMARY KEY (team_id),
    UNIQUE (team_uuid)
);

CREATE TABLE IF NOT EXISTS silver.shl_players
(
    player_id serial,
    player_uuid character varying(50) NOT NULL,
    team_id integer NOT NULL,
    first_name character varying(30) NOT NULL,
    last_name character varying(30) NOT NULL,
    full_name character varying(60),
    gender character varying(10),
    jersey_number integer NOT NULL,
    date_of_birth date NOT NULL,
    nationality character varying(2) NOT NULL,
    "position" character varying(20) NOT NULL,
    position_code character varying(2),
    shoots character varying(1),
    height_cm integer,
    weight_kg integer,
    valid_from date NOT NULL,
    valid_to date,
    is_current boolean NOT NULL DEFAULT TRUE,
    roster_status character varying(20) NOT NULL DEFAULT 'roster',
    portrait_url text,
    PRIMARY KEY (player_id),
    UNIQUE (player_uuid, valid_from)
);

CREATE TABLE IF NOT EXISTS bronze.shl_game_schedule
(
    id serial,
    season_uuid character varying(50) NOT NULL,
    raw_data jsonb NOT NULL,
    loaded_at timestamp with time zone NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS bronze.shl_athletes
(
    id serial,
    raw_data jsonb NOT NULL,
    loaded_at timestamp with time zone NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS silver.shl_games
(
    game_id serial,
    game_uuid character varying(50) NOT NULL,
    home_team_id integer NOT NULL,
    away_team_id integer NOT NULL,
    home_score integer,
    away_score integer,
    game_date timestamp with time zone NOT NULL,
    game_state character varying(20) NOT NULL,
    overtime boolean NOT NULL DEFAULT FALSE,
    shootout boolean NOT NULL DEFAULT FALSE,
    venue_name character varying(100),
    venue_uuid character varying(50),
    PRIMARY KEY (game_id),
    UNIQUE (game_uuid)
);

ALTER TABLE IF EXISTS silver.shl_players
    ADD FOREIGN KEY (team_id)
    REFERENCES silver.shl_teams (team_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS silver.shl_games
    ADD FOREIGN KEY (home_team_id)
    REFERENCES silver.shl_teams (team_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS silver.shl_games
    ADD FOREIGN KEY (away_team_id)
    REFERENCES silver.shl_teams (team_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

END;