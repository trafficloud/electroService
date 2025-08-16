import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck } from 'lucide-react';
import { Task } from '../../types';

interface CurrentTaskCardProps {
  task: Task | null;
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onMoveStart: (taskId: string) => void;
  loading: boolean;
}

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high': return 'Высокий';
    case 'medium': return 'Средний';
    case 'low': return 'Низкий';
    default: return 'Средний';
  }
};

export function CurrentTaskCard({ task, onStartTask, onCompleteTask, onMoveStart, loading }: CurrentTaskCardProps) {
  if (!task) {
    return (
      <Card className="p-4">
        <div className="text-center py-8">
          <div className="text-lg font-medium text-slate-900 mb-2">Нет текущей задачи</div>
          <div className="text-sm text-slate-500">Задачи будут назначены менеджером</div>
        </div>
      </Card>
    );
  }

  const priorityVariant = task.priority === 'high' ? 'warning' : 
                         task.priority === 'medium' ? 'secondary' : 'success';

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Моя текущая задача</h2>
        <Badge variant={priorityVariant}>
          {getPriorityLabel(task.priority)}
        </Badge>
      </div>
      
      <div className="text-slate-800 font-medium mb-1">{task.title}</div>
      <div className="text-sm text-slate-500 mb-2">{task.description}</div>
      {task.estimated_hours && (
        <div className="text-sm text-slate-500 mb-3">
          Оценка времени: {task.estimated_hours} ч
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-3">
        <Button
          variant="outline"
          size="default"
          className="h-12"
          onClick={() => onStartTask(task.id)}
          disabled={loading || task.status === 'in_progress' || task.status === 'completed'}
        >
          {task.status === 'in_progress' ? 'В работе' : 'В работу'}
        </Button>
        <Button
          variant="outline"
          size="default"
          className="h-12"
          onClick={() => onCompleteTask(task.id)}
          disabled={loading || task.status !== 'in_progress'}
        >
          Завершить
        </Button>
      </div>

      <Button
        size="xl"
        className="w-full mb-3"
        onClick={() => onMoveStart(task.id)}
        disabled={loading}
      >
        <Truck className="w-5 h-5 mr-2" />
        В путь
      </Button>

      {task.task_materials && task.task_materials.length > 0 && (
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <div className="font-medium mb-1">Материалы:</div>
          {task.task_materials.map((tm, idx) => (
            <span key={tm.id}>
              {tm.material?.name} ({tm.quantity_needed} {tm.material?.default_unit || 'шт'})
              {idx < task.task_materials.length - 1 ? ', ' : ''}
            </span>
          ))}
          <div className="mt-2 text-xs text-slate-500">
            • Фото-отчёт обязателен при завершении
          </div>
        </div>
      )}
    </Card>
  );
}