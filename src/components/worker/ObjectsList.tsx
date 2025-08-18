import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, MapPin } from 'lucide-react';
import { Task } from '../../types';

interface ObjectsListProps {
  tasks: Task[];
  onMoveStart: (taskId: string) => void;
  loading: boolean;
}

export function ObjectsList({ tasks, onMoveStart, loading }: ObjectsListProps) {
  // Фильтруем задачи, у которых есть target_location
  const tasksWithLocation = tasks.filter(task => task.target_location);

  if (tasksWithLocation.length === 0) {
    return (
      <Card className="p-4">
        <div className="mb-2">
          <h2 className="text-lg font-semibold">Объекты</h2>
        </div>
        <div className="text-center py-4 text-slate-500">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p className="text-sm">Нет объектов с адресами</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-3">
        <h2 className="text-lg font-semibold">Объекты</h2>
        <p className="text-sm text-slate-500">Объекты с адресами для посещения</p>
      </div>
      
      <div className="space-y-3">
        {tasksWithLocation.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
          >
            <div className="flex-1">
              <div className="font-medium text-sm text-slate-900 mb-1">
                {task.title}
              </div>
              <div className="flex items-center space-x-1 text-xs text-slate-600">
                <MapPin className="w-3 h-3" />
                <span>{task.target_location}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Статус: {
                  task.status === 'completed' ? 'Завершена' :
                  task.status === 'in_progress' ? 'В работе' :
                  task.status === 'paused' ? 'На паузе' :
                  'Ожидает'
                }
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-3"
              onClick={() => onMoveStart(task.id)}
              disabled={loading}
            >
              <Truck className="w-4 h-4 mr-1" />
              В путь
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}