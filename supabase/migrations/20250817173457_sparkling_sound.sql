/*
  # Add passport data columns to users table

  1. New Columns
    - `passport_series` (text, nullable) - серия паспорта
    - `passport_number` (text, nullable) - номер паспорта  
    - `passport_issue_date` (date, nullable) - дата выдачи паспорта
    - `passport_issued_by` (text, nullable) - кем выдан паспорт
    - `is_active` (boolean, default true) - активность пользователя

  2. Changes
    - Добавляет колонки для хранения паспортных данных сотрудников
    - Добавляет колонку для управления активностью пользователей
*/

-- Add passport data columns to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'passport_series'
  ) THEN
    ALTER TABLE users ADD COLUMN passport_series TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'passport_number'
  ) THEN
    ALTER TABLE users ADD COLUMN passport_number TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'passport_issue_date'
  ) THEN
    ALTER TABLE users ADD COLUMN passport_issue_date DATE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'passport_issued_by'
  ) THEN
    ALTER TABLE users ADD COLUMN passport_issued_by TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;