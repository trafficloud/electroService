/*
  # Создание таблицы рабочих смен

  1. Новые таблицы
    - `work_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `start_time` (timestamp)
      - `end_time` (timestamp, nullable)
      - `start_location` (text, GPS координаты)
      - `end_location` (text, GPS координаты)
      - `total_hours` (numeric)
      - `earnings` (numeric)
      - `created_at` (timestamp)

  2. Безопасность
    - Включить RLS для таблицы `work_sessions`
    - Политики для рабочих (только свои смены)
    - Политики для менеджеров (все смены)
*/

-- Создание таблицы рабочих смен
CREATE TABLE IF NOT EXISTS work_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  start_location text,
  end_location text,
  total_hours numeric(5,2),
  earnings numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- Включение RLS
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;

-- Политики доступа
CREATE POLICY "Рабочие могут читать свои смены"
  ON work_sessions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('manager', 'director', 'admin')
    )
  );

CREATE POLICY "Рабочие могут создавать свои смены"
  ON work_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Рабочие могут обновлять свои смены"
  ON work_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS work_sessions_user_id_idx ON work_sessions(user_id);
CREATE INDEX IF NOT EXISTS work_sessions_start_time_idx ON work_sessions(start_time);