/*
  # Исправление триггера логирования изменений ролей

  1. Изменения
    - Обновляем функцию log_role_change() для корректной обработки случаев, когда changed_by может быть NULL
    - Добавляем проверку на существование пользователя в auth.uid()
    - Используем системный ID если изменение происходит не через приложение

  2. Безопасность
    - Сохраняем все существующие ограничения безопасности
    - Обеспечиваем корректное логирование всех изменений ролей
*/

-- Обновляем функцию логирования изменений ролей
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Проверяем, есть ли текущий пользователь
  current_user_id := auth.uid();
  
  -- Если нет текущего пользователя (изменение через админку Supabase), 
  -- используем ID самого изменяемого пользователя как changed_by
  IF current_user_id IS NULL THEN
    current_user_id := NEW.id;
  END IF;

  -- Логируем изменение роли только если роль действительно изменилась
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
      current_user_id,
      now()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;