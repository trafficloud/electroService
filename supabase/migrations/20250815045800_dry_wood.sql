/*
  # Создание таблицы логов изменения ролей

  1. Новые таблицы
    - `role_change_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `old_role` (text)
      - `new_role` (text)
      - `changed_by` (uuid, foreign key to users)
      - `changed_at` (timestamp)

  2. Безопасность
    - Включить RLS для таблицы
    - Политики только для администраторов и директоров
*/

-- Создание таблицы логов изменения ролей
CREATE TABLE IF NOT EXISTS role_change_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  old_role text NOT NULL,
  new_role text NOT NULL,
  changed_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  changed_at timestamptz DEFAULT now()
);

-- Включение RLS
ALTER TABLE role_change_logs ENABLE ROW LEVEL SECURITY;

-- Политики доступа
CREATE POLICY "Только администраторы могут читать логи"
  ON role_change_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('director', 'admin')
    )
  );

CREATE POLICY "Только администраторы могут создавать логи"
  ON role_change_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('director', 'admin')
    )
  );

-- Функция для автоматического логирования изменений ролей
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role != NEW.role THEN
    INSERT INTO role_change_logs (user_id, old_role, new_role, changed_by)
    VALUES (NEW.id, OLD.role::text, NEW.role::text, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического логирования
CREATE TRIGGER log_role_change_trigger
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_role_change();

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS role_change_logs_user_id_idx ON role_change_logs(user_id);
CREATE INDEX IF NOT EXISTS role_change_logs_changed_at_idx ON role_change_logs(changed_at);