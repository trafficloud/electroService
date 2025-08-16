/*
  # Добавление геолокации для задач

  1. Новые поля
    - `start_location` (text) - GPS координаты начала задачи
    - `end_location` (text) - GPS координаты завершения задачи
    - `started_at` (timestamp) - время начала задачи
    - `completed_at` (timestamp) - время завершения задачи

  2. Безопасность
    - Обновление RLS политик для новых полей
*/

-- Добавляем новые поля в таблицу tasks
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS start_location text,
ADD COLUMN IF NOT EXISTS end_location text,
ADD COLUMN IF NOT EXISTS started_at timestamptz,
ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS tasks_started_at_idx ON tasks(started_at);
CREATE INDEX IF NOT EXISTS tasks_completed_at_idx ON tasks(completed_at);

-- Обновляем RLS политики для рабочих
DROP POLICY IF EXISTS "Рабочие могут обновлять статус св" ON tasks;

CREATE POLICY "Рабочие могут обновлять статус своих задач"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());