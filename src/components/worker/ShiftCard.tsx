import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { ShiftStatus } from '@/lib/workerState';

interface ShiftCardProps {
  status: ShiftStatus;
  outside: boolean;
  currentTime: string;
  currentTaskTargetLocation?: string;
  currentTaskId?: string;
  onMainAction: () => void;
  onMoveStart: (taskId: string) => void;
  loading: boolean;
}

function mainCtaLabel(status: ShiftStatus, outside: boolean): string {
  if (status === 'idle') return outside ? 'Начать (unverified)' : 'Начать работу';
  if (status === 'running') return 'Завершить смену';
  return 'Вернуться к работе';
}

export function ShiftCard({ status, outside, currentTime, currentTaskTargetLocation, currentTaskId, onMainAction, onMoveStart, loading }: ShiftCardProps) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Текущая смена</h2>
        <div className="text-sm text-slate-500">
          {status === 'running' ? `в смене ${currentTime}` : '—'}
        </div>
      </div>

      <div className="mb-3 text-slate-600">
        <div className="flex items-center justify-between text-sm">
          <span>Объект: {currentTaskTargetLocation || 'Не выбран'}</span>
          <span className={`flex items-center gap-1 ${outside ? 'text-rose-600' : 'text-emerald-600'}`}>
            <MapPin className="w-3 h-3" />
            {outside ? 'Вне геозоны (≈300 м)' : 'В геозоне'}
          </span>
        </div>
      </div>

      <Button
        size="xl"
        className="w-full"
        variant={status === 'running' ? 'destructive' : 'default'}
        onClick={onMainAction}
        disabled={loading}
      >
        {mainCtaLabel(status, outside)}
      </Button>

      {/* Move to object button */}
      {currentTaskTargetLocation && (
        <Button
          size="default"
          variant="outline"
          className="w-full mt-2"
          onClick={() => currentTaskId && onMoveStart(currentTaskId)}
          disabled={loading || !currentTaskId}
        >
          <Truck className="w-4 h-4 mr-2" />
          В путь к объекту
        </Button>
      )}
    </Card>
  );
}