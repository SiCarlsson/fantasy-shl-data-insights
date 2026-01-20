# Database Schema

## Structure
- **Bronze Layer**: Raw JSONB data from SHL API
- **Silver Layer**: Cleaned, typed data with SCD Type 2 for players
- **Gold Layer**: (Coming soon) Dimensional model for analytics

## Setup
```sql
-- Run in PostgreSQL
psql -U postgres -d fantasy_sports_db -f schemas/001_initial_schema.sql