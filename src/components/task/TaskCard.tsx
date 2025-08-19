import React from 'react';
import { Task, User } from '../../types';
import { MapButton } from '../MapDisplay';
import {
  MapPin,
  Package,
  Edit3,
  Trash2,
  Check,
  X,
  Play,
  Square,
  Loader2,
  Pause,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  profile: User | null;
  setEditingTask: (task: Task) => void;
  deletingTask: string | null;
  setDeletingTask: (id: string | null) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  updatingTask: string | null;
}

const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'pending':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  profile,
  setEditingTask,
  deletingTask,
  setDeletingTask,
  deleteTask,
  updateTaskStatus,
  updatingTask,
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
        profile?.role === 'worker' ? 'border-l-4' : 'border-gray-200'
      } ${
        profile?.role === 'worker' && task.status === 'pending'
          ? 'border-l-yellow-400'
          : profile?.role === 'worker' && task.status === 'in_progress'
          ? 'border-l-blue-400'
          : profile?.role === 'worker' && task.status === 'paused'
          ? 'border-l-yellow-400'
          : profile?.role === 'worker' && task.status === 'completed'
          ? 'border-l-green-400'
          : 'border-l-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3
            className={`font-semibold text-gray-900 mb-2 ${
              profile?.role === 'worker' ? 'text-lg' : ''
            }`}
          >
            {task.title}
          </h3>
          <p
            className={`text-gray-600 line-clamp-3 ${
              profile?.role === 'worker' ? 'text-base' : 'text-sm'
            }`}
          >
            {task.description}
          </p>
        </div>
        <div
          className={`flex flex-col space-y-2 ml-4 ${
            profile?.role === 'worker' ? 'items-end' : ''
          }`}
        >
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
              task.priority
            )}`}
          >
            {task.priority === 'high'
              ? 'Высокий'
              : task.priority === 'medium'
              ? 'Средний'
              : 'Низкий'}
          </span>
          <span
            className={`px-2 py-1 font-medium rounded-full border ${getStatusColor(
              task.status
            )} ${profile?.role === 'worker' ? 'text-sm px-3 py-1' : 'text-xs'}`}
          >
            {task.status === 'completed'
              ? 'Завершена'
              : task.status === 'in_progress'
              ? 'В работе'
              : task.status === 'paused'
              ? 'На паузе'
              : 'Ожидает'}
          </span>
        </div>
      </div>

      {/* Worker-specific info */}
      {profile?.role === 'worker' && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Оценка времени:</span>
            <span className="font-medium text-gray-900">
              {task.estimated_hours ? `${task.estimated_hours} ч` : 'Не указано'}
            </span>
          </div>
          {task.start_location && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600 flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>Начато:</span>
              </span>
              <span className="text-green-600 font-medium">
                {task.started_at &&
                  format(new Date(task.started_at), 'dd.MM HH:mm', { locale: ru })}
              </span>
            </div>
          )}
          {task.end_location && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600 flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>Завершено:</span>
              </span>
              <span className="text-blue-600 font-medium">
                {task.completed_at &&
                  format(new Date(task.completed_at), 'dd.MM HH:mm', { locale: ru })}
              </span>
            </div>
          )}
          {task.paused_at && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600 flex items-center space-x-1">
                <Pause className="w-3 h-3" />
                <span>Приостановлено:</span>
              </span>
              <span className="text-yellow-600 font-medium">
                {format(new Date(task.paused_at), 'dd.MM HH:mm', { locale: ru })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Assignee */}
      {task.assignee && profile?.role !== 'worker' && (
        <div className="flex items-center space-x-2 mb-3">
          <UserIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{task.assignee.full_name}</span>
        </div>
      )}

      {/* Location info for managers */}
      {profile?.role === 'manager' && (task.start_location || task.end_location) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Геолокация</span>
          </div>

          {task.start_location && task.started_at && (
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Начато:</span>
              <div className="flex items-center space-x-2">
                <span className="text-green-600 font-medium">
                  {format(new Date(task.started_at), 'dd.MM HH:mm', { locale: ru })}
                </span>
                <MapButton
                  coordinates={task.start_location}
                  title={`Начало работы: ${task.title}`}
                  variant="start"
                />
              </div>
            </div>
          )}

          {task.end_location && task.completed_at && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Завершено:</span>
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 font-medium">
                  {format(new Date(task.completed_at), 'dd.MM HH:mm', { locale: ru })}
                </span>
                <MapButton
                  coordinates={task.end_location}
                  title={`Завершение работы: ${task.title}`}
                  variant="end"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Materials */}
      {task.materials && task.materials.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span
              className={`font-medium text-gray-700 ${
                profile?.role === 'worker' ? 'text-base' : 'text-sm'
              }`}
            >
              Материалы
            </span>
          </div>
          <div className="space-y-1">
            {task.materials.map((tm) => (
              <div
                key={tm.id}
                className={`text-gray-600 flex justify-between ${
                  profile?.role === 'worker' ? 'text-sm' : 'text-xs'
                }`}
              >
                <span>{tm.material?.name}</span>
                <span>
                  {tm.quantity_needed} {tm.material?.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div
        className={`flex space-x-2 mb-3 ${
          profile?.role === 'worker' ? 'flex-col space-x-0 space-y-2' : ''
        }`}
      >
        {/* Manager actions */}
        {profile?.role === 'manager' && (
          <>
            <button
              onClick={() => setEditingTask(task)}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>Изменить</span>
            </button>
            {deletingTask === task.id ? (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => deleteTask(task.id)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  <Check className="w-3 h-3" />
                  <span>Да</span>
                </button>
                <button
                  onClick={() => setDeletingTask(null)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Нет</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeletingTask(task.id)}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Удалить</span>
              </button>
            )}
          </>
        )}

        {task.paused_at && (
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600 flex items-center space-x-1">
              <Pause className="w-4 h-4" />
              <span>Приостановлено:</span>
            </span>
            <span className="text-yellow-600 font-medium">
              {format(new Date(task.paused_at), 'dd.MM HH:mm', { locale: ru })}
            </span>
          </div>
        )}
      </div>

      {/* Worker actions */}
      {profile?.role === 'worker' && task.assigned_to === profile.id && (
        <div className="space-y-2">
          {task.status === 'pending' && (
            <button
              onClick={() => updateTaskStatus(task.id, 'in_progress')}
              disabled={updatingTask === task.id}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {updatingTask === task.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Начать работу</span>
                </>
              )}
            </button>
          )}
          {task.status === 'paused' && (
            <button
              onClick={() => updateTaskStatus(task.id, 'in_progress')}
              disabled={updatingTask === task.id}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {updatingTask === task.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Продолжить работу</span>
                </>
              )}
            </button>
          )}
          {task.status === 'in_progress' && (
            <>
              <button
                onClick={() => updateTaskStatus(task.id, 'paused')}
                disabled={updatingTask === task.id}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {updatingTask === task.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Приостановить</span>
                  </>
                )}
              </button>
              <button
                onClick={() => updateTaskStatus(task.id, 'completed')}
                disabled={updatingTask === task.id}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {updatingTask === task.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Square className="w-5 h-5" />
                    <span>Завершить работу</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* Timestamp */}
      <div
        className={`mt-4 pt-3 border-t border-gray-100 ${
          profile?.role === 'worker' ? 'text-center' : ''
        }`}
      >
        <div
          className={`flex items-center space-x-2 text-gray-500 ${
            profile?.role === 'worker' ? 'text-sm justify-center' : 'text-xs'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>
            Создана {format(new Date(task.created_at), 'dd MMM, HH:mm', { locale: ru })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
