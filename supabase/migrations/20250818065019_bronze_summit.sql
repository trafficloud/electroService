/*
  # Add 'paused' value to task_status enum

  1. Database Changes
    - Add 'paused' value to the existing task_status enum type
    - This allows tasks to have a paused status in addition to pending, in_progress, and completed

  2. Security
    - No changes to RLS policies needed
    - Existing policies will work with the new enum value

  3. Notes
    - This is a safe operation that extends the enum without breaking existing data
    - All existing tasks will retain their current status values
*/

-- Add 'paused' value to the task_status enum
ALTER TYPE task_status ADD VALUE 'paused';