/*
  # Add paused_at column to tasks table

  1. Changes
    - Add `paused_at` column to `tasks` table
    - Column type: timestamp with time zone (nullable)
    - Used to track when a task was paused

  2. Purpose
    - Enable task pause functionality in the worker interface
    - Track pause timestamps for time calculations
*/

-- Add paused_at column to tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'paused_at'
  ) THEN
    ALTER TABLE tasks ADD COLUMN paused_at timestamptz;
  END IF;
END $$;