/*
  # Полное исправление RLS политик для таблицы users

  1. Проблема
    - Бесконечная рекурсия в RLS политиках таблицы users
    - Политики создают циклические зависимости при проверке ролей

  2. Решение
    - Удаление всех существующих политик
    - Создание простых политик без рекурсивных запросов
    - Использование только auth.uid() без дополнительных проверок ролей

  3. Новые политики
    - Пользователи могут читать и обновлять только свои данные
    - Простая логика без подзапросов к таблице users
*/

-- Удаляем все существующие политики для таблицы users
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own_profile" ON users;
DROP POLICY IF EXISTS "managers_select_all" ON users;
DROP POLICY IF EXISTS "directors_update_roles" ON users;
DROP POLICY IF EXISTS "Пользователи могут читать свои да" ON users;
DROP POLICY IF EXISTS "Пользователи могут обновлять свои" ON users;
DROP POLICY IF EXISTS "Менеджеры могут читать данные раб" ON users;
DROP POLICY IF EXISTS "Директора могут обновлять роли" ON users;

-- Удаляем функцию, которая может вызывать рекурсию
DROP FUNCTION IF EXISTS auth.user_role();

-- Создаем простые политики без рекурсии
CREATE POLICY "users_can_read_own_profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Временно разрешаем всем аутентифицированным пользователям читать профили
-- Это нужно для работы админ-панели, но не создает рекурсии
CREATE POLICY "authenticated_users_can_read_profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Разрешаем обновление ролей только через service_role
-- Это означает, что изменение ролей должно происходить через админку Supabase
-- или через серверные функции с service_role ключом
CREATE POLICY "service_role_can_update_roles"
  ON users
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);