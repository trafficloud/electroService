/*
  # Создание таблиц для материалов

  1. Новые таблицы
    - `materials` - справочник материалов
      - `id` (uuid, primary key)
      - `name` (text)
      - `unit` (text, единица измерения)
      - `cost_per_unit` (numeric)
      - `stock_quantity` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `task_materials` - материалы по задачам
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key)
      - `material_id` (uuid, foreign key)
      - `quantity_needed` (numeric)
      - `quantity_used` (numeric)

    - `material_usages` - использование материалов
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key)
      - `material_id` (uuid, foreign key)
      - `quantity_used` (numeric)
      - `used_by` (uuid, foreign key to users)
      - `used_at` (timestamp)

  2. Безопасность
    - Включить RLS для всех таблиц
    - Политики доступа по ролям
*/

-- Создание таблицы материалов
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unit text NOT NULL DEFAULT 'шт',
  cost_per_unit numeric(10,2) NOT NULL DEFAULT 0,
  stock_quantity numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы материалов по задачам
CREATE TABLE IF NOT EXISTS task_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  quantity_needed numeric(10,2) NOT NULL DEFAULT 0,
  quantity_used numeric(10,2) DEFAULT 0,
  UNIQUE(task_id, material_id)
);

-- Создание таблицы использования материалов
CREATE TABLE IF NOT EXISTS material_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  quantity_used numeric(10,2) NOT NULL,
  used_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used_at timestamptz DEFAULT now()
);

-- Включение RLS для всех таблиц
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_usages ENABLE ROW LEVEL SECURITY;

-- Политики для materials
CREATE POLICY "Все могут читать материалы"
  ON materials
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Менеджеры могут управлять материалами"
  ON materials
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('manager', 'director', 'admin')
    )
  );

-- Политики для task_materials
CREATE POLICY "Все могут читать материалы задач"
  ON task_materials
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Менеджеры могут управлять материалами задач"
  ON task_materials
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('manager', 'director', 'admin')
    )
  );

-- Политики для material_usages
CREATE POLICY "Рабочие могут читать использование материалов"
  ON material_usages
  FOR SELECT
  TO authenticated
  USING (
    used_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('manager', 'director', 'admin')
    )
  );

CREATE POLICY "Рабочие могут записывать использование материалов"
  ON material_usages
  FOR INSERT
  TO authenticated
  WITH CHECK (used_by = auth.uid());

-- Триггеры для обновления updated_at
CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS task_materials_task_id_idx ON task_materials(task_id);
CREATE INDEX IF NOT EXISTS task_materials_material_id_idx ON task_materials(material_id);
CREATE INDEX IF NOT EXISTS material_usages_task_id_idx ON material_usages(task_id);
CREATE INDEX IF NOT EXISTS material_usages_used_by_idx ON material_usages(used_by);