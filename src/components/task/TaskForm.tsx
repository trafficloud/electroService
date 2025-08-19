import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Task, User, Material } from '../../types';

interface TaskFormProps {
  task?: Task;
  users: User[];
  materials: Material[];
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  users,
  materials,
  onClose,
  onSuccess,
}) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: (task?.priority || 'medium') as Task['priority'],
    assigned_to: task?.assigned_to || '',
    estimated_hours: task?.estimated_hours?.toString() || '',
  });
  const [selectedMaterials, setSelectedMaterials] = useState<Array<{
    id?: string;
    material_id: string;
    quantity_needed: number;
  }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task?.materials) {
      setSelectedMaterials(
        task.materials.map((tm) => ({
          id: tm.id,
          material_id: tm.material_id,
          quantity_needed: tm.quantity_needed,
        }))
      );
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      let taskData;

      if (task) {
        const { data, error: taskError } = await supabase
          .from('tasks')
          .update({
            ...formData,
            estimated_hours: formData.estimated_hours
              ? parseFloat(formData.estimated_hours)
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', task.id)
          .select()
          .single();

        if (taskError) throw taskError;
        taskData = data;

        await supabase.from('task_materials').delete().eq('task_id', task.id);
      } else {
        const { data, error: taskError } = await supabase
          .from('tasks')
          .insert({
            ...formData,
            created_by: profile.id,
            estimated_hours: formData.estimated_hours
              ? parseFloat(formData.estimated_hours)
              : null,
          })
          .select()
          .single();

        if (taskError) throw taskError;
        taskData = data;
      }

      if (selectedMaterials.length > 0) {
        const { error: materialsError } = await supabase
          .from('task_materials')
          .insert(
            selectedMaterials.map((m) => ({
              task_id: taskData.id,
              material_id: m.material_id,
              quantity_needed: m.quantity_needed,
            }))
          );

        if (materialsError) throw materialsError;
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating task:', error);
      alert(task ? 'Ошибка при обновлении задачи' : 'Ошибка при создании задачи');
    } finally {
      setLoading(false);
    }
  };

  const addMaterial = () => {
    setSelectedMaterials([
      ...selectedMaterials,
      { material_id: '', quantity_needed: 1 },
    ]);
  };

  const removeMaterial = (index: number) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
  };

  const updateMaterial = (
    index: number,
    field: 'material_id' | 'quantity_needed',
    value: string | number
  ) => {
    const updated = [...selectedMaterials];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedMaterials(updated);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {task ? 'Редактировать задачу' : 'Создать задачу'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название задачи
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите название задачи"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Опишите задачу подробнее"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Приоритет
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as Task['priority'],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Исполнитель
                </label>
                <select
                  required
                  value={formData.assigned_to}
                  onChange={(e) =>
                    setFormData({ ...formData, assigned_to: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Выберите исполнителя</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Оценка времени (ч)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.estimated_hours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimated_hours: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Materials */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Материалы
                </label>
                <button
                  type="button"
                  onClick={addMaterial}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Добавить материал
                </button>
              </div>

              {selectedMaterials.map((material, index) => (
                <div key={index} className="flex items-center space-x-3 mb-3">
                  <select
                    value={material.material_id}
                    onChange={(e) =>
                      updateMaterial(index, 'material_id', e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Выберите материал</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.unit})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={material.quantity_needed}
                    onChange={(e) =>
                      updateMaterial(index, 'quantity_needed', parseInt(e.target.value))
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Кол-во"
                  />
                  <button
                    type="button"
                    onClick={() => removeMaterial(index)}
                    className="text-red-600 hover:text-red-700 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? task
                    ? 'Сохранение...'
                    : 'Создание...'
                  : task
                  ? 'Сохранить изменения'
                  : 'Создать задачу'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
