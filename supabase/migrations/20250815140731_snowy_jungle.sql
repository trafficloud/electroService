/*
  # Исправление политик для обновления ролей пользователей

  1. Политики безопасности
    - Обновляем политику для service_role
    - Добавляем политику для администраторов
    - Исправляем функцию логирования изменений ролей

  2. Функции
    - Обновляем функцию логирования изменений ролей
    - Добавляем проверки безопасности
*/

-- Удаляем существующие политики для обновления ролей
DROP POLICY IF EXISTS "service_role_can_update_roles" ON users;

-- Создаем новую политику для service_role (используется Supabase для административных операций)
CREATE POLICY "service_role_can_update_all_users"
  ON users
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Создаем политику для администраторов
CREATE POLICY "admins_can_update_user_roles"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- Обновляем функцию логирования изменений ролей
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Проверяем, изменилась ли роль
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO role_change_logs (
      user_id,
      old_role,
      new_role,
      changed_by,
      changed_at
    ) VALUES (
      NEW.id,
      OLD.role,
      NEW.role,
      COALESCE(auth.uid(), NEW.id), -- Если нет текущего пользователя, используем ID обновляемого пользователя
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Пересоздаем триггер для логирования изменений ролей
DROP TRIGGER IF EXISTS log_role_change_trigger ON users;
CREATE TRIGGER log_role_change_trigger
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_role_change();

-- Добавляем индекс для улучшения производительности запросов по ролям
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

-- Обновляем функцию обновления времени изменения
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;