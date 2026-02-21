-- Add name_en column to composers table
-- name_en = same as name (English name), kept for backward compatibility with codebase
ALTER TABLE composers ADD COLUMN IF NOT EXISTS name_en TEXT;
UPDATE composers SET name_en = name WHERE name_en IS NULL;

-- Also add name_original column if missing (used in pieces-queries.ts)
ALTER TABLE composers ADD COLUMN IF NOT EXISTS name_original TEXT;
