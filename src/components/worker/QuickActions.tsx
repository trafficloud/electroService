import React from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Camera, Phone } from 'lucide-react';
import { ShiftStatus } from '@/lib/workerState';

interface QuickActionsProps {
  status: ShiftStatus;
  onPause: () => void;
  onPhotoReport: () => void;
  onCallManager: () => void;
  loading: boolean;
}

export function QuickActions({ status, onPause, onPhotoReport, onCallManager, loading }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Button
        variant="outline"
        size="default"
        className="h-12"
        onClick={onPause}
        disabled={loading}
      >
        <Pause className="w-4 h-4 mr-1" />
        Перерыв
      </Button>
      <Button
        variant="outline"
        size="default"
        className="h-12"
        onClick={onPhotoReport}
        disabled={loading}
      >
        <Camera className="w-4 h-4 mr-1" />
        Фото-отчёт
      </Button>
      <Button
        variant="outline"
        size="default"
        className="h-12"
        onClick={onCallManager}
        disabled={loading}
      >
        <Phone className="w-4 h-4 mr-1" />
        Позвонить
      </Button>
    </div>
  );
}