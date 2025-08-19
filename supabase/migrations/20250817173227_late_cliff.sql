/*
  # Add target_location column to tasks table

  1. Changes
    - Add `target_location` column to `tasks` table
    - Column type: TEXT (nullable)
    - This column will store the target address/location for tasks

  2. Purpose
    - Allow managers to specify target locations when creating tasks
    - Support location-based task management
*/

-- Add target_location column to tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'target_location'
  ) THEN
    ALTER TABLE tasks ADD COLUMN target_location TEXT;
  END IF;
END $$;