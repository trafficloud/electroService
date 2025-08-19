import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase, getCurrentLocation, formatLocation } from '../lib/supabase';
import { Task, User, Material } from '../types';
import {
  Plus,
  CheckSquare
} from 'lucide-react';
import TaskFilters, { TaskFilter } from './task/TaskFilters';
import TaskCard from './task/TaskCard';
import TaskForm from './task/TaskForm';

export const TaskManager: React.FC = () => {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
    if (profile?.role === 'manager') {
      fetchUsers();
      fetchMaterials();
    }
  }, [profile]);

  const fetchTasks = async () => {
    if (!profile) return;

    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:assigned_to(id, full_name, email),
        creator:created_by(id, full_name, email),
        task_materials(
          id,
          quantity_needed,
          quantity_used,
          material:material_id(id, name, unit, cost_per_unit)
        )
      `)
      .order('created_at', { ascending: false });

    // Workers only see their own tasks
    if (profile.role === 'worker') {
      query = query.eq('assigned_to', profile.id);
    }

    const { data, error } = await query;

    if (!error && data) {
      setTasks(data);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('role', ['worker', 'manager'])
      .order('full_name');

    if (!error && data) {
      setUsers(data);
    }
  };

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('name');

    if (!error && data) {
      setMaterials(data);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    setUpdatingTask(taskId);
    
    try {
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString()
      };

      // Получаем геолокацию для начала или завершения задачи
      if (status === 'in_progress' || status === 'completed') {
        try {
          const position = await getCurrentLocation();
          const location = formatLocation(position);
          
          if (status === 'in_progress') {
            // Если задача была на паузе, не перезаписываем start_location
            const currentTask = tasks.find(t => t.id === taskId);
            if (!currentTask?.start_location) {
              updateData.start_location = location;
              updateData.started_at = new Date().toISOString();
            }
            // Сбрасываем время паузы при возобновлении
            updateData.paused_at = null;
          } else if (status === 'completed') {
            updateData.end_location = location;
            updateData.completed_at = new Date().toISOString();
          }
        } catch (locationError) {
          console.warn('Не удалось получить геолокацию:', locationError);
          // Продолжаем без геолокации, но предупреждаем пользователя
          if (!confirm('Не удалось определить местоположение. Продолжить без GPS-координат?')) {
            return;
          }
        }
      } else if (status === 'paused') {
        // При постановке на паузу сохраняем время паузы
        updateData.paused_at = new Date().toISOString();
      }

      const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId);

      if (error) throw error;
      
      await fetchTasks();
    } catch (error) {
      console.error('Ошибка обновления задачи:', error);
      alert('Ошибка при обновлении статуса задачи');
    } finally {
      setUpdatingTask(null);
    }
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (!error) {
      fetchTasks();
      setDeletingTask(null);
    } else {
      alert('Ошибка при удалении задачи');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profile?.role === 'worker' ? 'Мои задачи' : 'Управление задачами'}
            </h1>
            <p className="text-gray-600 mt-1">
              {profile?.role === 'worker' 
                ? 'Ваши назначенные задачи и их статус' 
                : 'Создание и управление задачами команды'
              }
            </p>
          </div>
        
          {profile?.role === 'manager' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Создать задачу</span>
            </button>
          )}
        </div>


        {/* Filters */}
        <TaskFilters
          filter={filter}
          setFilter={setFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет задач</h3>
          <p className="text-gray-500">
            {filter === 'all' ? 'Задачи не найдены' : `Нет задач со статусом "${filter}"`}
          </p>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          profile?.role === 'worker'
            ? 'grid-cols-1 lg:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              profile={profile}
              setEditingTask={setEditingTask}
              deletingTask={deletingTask}
              setDeletingTask={setDeletingTask}
              deleteTask={deleteTask}
              updateTaskStatus={updateTaskStatus}
              updatingTask={updatingTask}
            />
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateForm && (
        <TaskForm
          users={users}
          materials={materials}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            fetchTasks();
          }}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskForm
          task={editingTask}
          users={users}
          materials={materials}
          onClose={() => setEditingTask(null)}
          onSuccess={() => {
            setEditingTask(null);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
};
