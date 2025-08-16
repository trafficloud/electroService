import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock } from 'lucide-react';
import { ShiftStatus } from '@/lib/workerState';

interface HeaderStatusProps {
  status: ShiftStatus;
  geoVerified: boolean;
  outside: boolean;
  currentTime: string;
}

function geoBadgeText(geoVerified: boolean, outside: boolean): string {
  if (!geoVerified) return 'gps off';
  return outside ? 'вне зоны' : 'verified';
}

function getStatusLabel(status: ShiftStatus): string {
  switch (status) {
    case 'running': return 'Смена идёт';
    case 'pause': return 'Пауза';
    default: return 'Смена не начата';
  }
}

export function HeaderStatus({ status, geoVerified, outside, currentTime }: HeaderStatusProps) {
  const statusLabel = getStatusLabel(status);
  
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-sm items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">ЭлектроСервис • Worker</div>
            <div className="text-base font-semibold">Рабочий экран</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
            status === 'running'
              ? 'bg-green-100 text-green-800'
              : status === 'pause'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-slate-100 text-slate-700'
          }`}>
            {statusLabel}
            <Badge 
              variant={geoVerified && !outside ? 'success' : outside ? 'warning' : 'muted'}
              className="ml-1"
            >
              {geoBadgeText(geoVerified, outside)}
            </Badge>
          </span>
        </div>
      </div>
      
      {/* Время */}
      <div className="mx-auto max-w-sm px-4 pb-2">
        <div className="flex items-center justify-center text-sm text-slate-500">
          <Clock className="w-4 h-4 mr-1" />
          {currentTime}
        </div>
      </div>
    </header>
  );
}