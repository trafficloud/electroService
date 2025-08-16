import React, { useState, useEffect } from 'react';
import { useWorkerState, formatTime } from '@/lib/workerState';
import { useToast } from '@/hooks/useToast';
import * as api from '@/lib/api';
import { HeaderStatus } from './HeaderStatus';
import { ShiftCard } from './ShiftCard';
import { QuickActions } from './QuickActions';
import { CurrentTaskCard } from './CurrentTaskCard';
import { EarningsToday } from './EarningsToday';
import { HistoryMini } from './HistoryMini';
import { Button } from '@/components/ui/button';
import { mainCtaLabel } from '@/lib/workerState';

export function WorkerSuperScreen() {
  const { state, actions } = useWorkerState();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tab, setTab] = useState<'time' | 'tasks'>('time');

  // Обновляем время каждую секунду
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Обновляем таймер смены
  useEffect(() => {
    if (state.shiftStatus === 'running') {
      const timer = setInterval(() => {
        actions.updateTimer(state.currentSeconds + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state.shiftStatus, state.currentSeconds, actions]);

  const handleMainAction = async () => {
    actions.setLoading(true);
    try {
      if (state.shiftStatus === 'idle') {
        const result = await api.startShift();
        actions.startShift();
        toast({
          title: "Смена началась",
          description: result.message,
          variant: "success",
        });
      } else if (state.shiftStatus === 'running') {
        const hours = state.currentSeconds / 3600;
        const result = await api.endShift(hours, state.todayEarnings);
        actions.endShift();
        toast({
          title: "Смена завершена",
          description: result.message,
          variant: "success",
        });
      } else {
        const result = await api.resumeShift();
        actions.resumeShift();
        toast({
          title: "Работа возобновлена",
          description: result.message,
          variant: "success",
        });
      }
    } catch (error) {
      actions.setError(error instanceof Error ? error.message : 'Произошла ошибка');
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Произошла ошибка',
        variant: "destructive",
      });
    } finally {
      actions.setLoading(false);
    }
  };

  const handlePause = async () => {
    actions.setLoading(true);
    try {
      const result = await api.pauseShift();
      actions.pauseShift();
      toast({
        title: "Перерыв",
        description: result.message,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Произошла ошибка',
        variant: "destructive",
      });
    } finally {
      actions.setLoading(false);
    }
  };

  const handlePhotoReport = async () => {
    actions.setLoading(true);
    try {
      const result = await api.photoReport();
      toast({
        title: "Фото-отчёт",
        description: result.message,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Произошла ошибка',
        variant: "destructive",
      });
    } finally {
      actions.setLoading(false);
    }
  };

  const handleCallManager = async () => {
    actions.setLoading(true);
    try {
      const result = await api.callManager();
      toast({
        title: "Звонок менеджеру",
        description: result.message,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Произошла ошибка',
        variant: "destructive",
      });
    } finally {
      actions.setLoading(false);
    }
  };

  const handleMoveStart = async (taskId: string) => {
    actions.setLoading(true);
    try {
      const result = await api.moveStart(taskId);
      
      // Открываем карты
      if (state.currentTask?.coords) {
        api.openMaps(state.currentTask.coords, state.currentTask.address);
      } else {
        api.openMaps(undefined, state.currentTask?.address);
      }
      
      toast({
        title: "В путь",
        description: result.message,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Произошла ошибка',
        variant: "destructive",
      });
    } finally {
      actions.setLoading(false);
    }
  };

  const handleStartTask = async (taskId: string) => {
    actions.setLoading(true);
    try {
      const result = await api.startTask(taskId);
      actions.startTask(taskId);
      toast({
        title: "Задача в работе",
        description: result.message,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Произошла ошибка',
        variant: "destructive",
      });
    } finally {
      actions.setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    actions.setLoading(true);
    try {
      const result = await api.completeTask(taskId);
      actions.completeTask(taskId);
      toast({
        title: "Задача завершена",
        description: result.message,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Произошла ошибка',
        variant: "destructive",
      });
    } finally {
      actions.setLoading(false);
    }
  };

  const mockHistory = [
    { date: '16.08', hours: 7.2, earnings: 5200 },
    { date: '15.08', hours: 6.75, earnings: 4900 },
    { date: '14.08', hours: 8.05, earnings: 5950 },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-slate-900">
      <HeaderStatus
        status={state.shiftStatus}
        geoVerified={state.geoVerified}
        outside={state.outside}
        currentTime={currentTime.toLocaleTimeString('ru-RU')}
      />

      {/* Табы */}
      <div className="mx-auto max-w-sm px-4 py-3">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {[
            { id: 'time', label: 'Время' },
            { id: 'tasks', label: 'Задачи' },
          ].map((t) => (
            <button
              key={t.id}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                tab === (t.id as any)
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-100 text-slate-700'
              }`}
              onClick={() => setTab(t.id as any)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Контент */}
      <main className="mx-auto max-w-sm space-y-5 px-4 pb-24">
        {/* Компактное приветствие + KPI дня */}
        <section className="flex items-center gap-2">
          <div className="text-sm text-slate-500">Добрый день, Рабочий!</div>
          <div className="ml-auto flex gap-2">
            <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium">
              Сегодня: <span className="font-bold">{state.todayEarnings.toLocaleString()} ₽</span>
            </div>
            <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium">
              <span className="font-bold">{state.todayHours} ч</span>
            </div>
          </div>
        </section>

        {tab === 'time' && (
          <>
            <ShiftCard
              status={state.shiftStatus}
              outside={state.outside}
              currentTime={formatTime(state.currentSeconds)}
              onMainAction={handleMainAction}
              loading={state.isLoading}
            />

            <QuickActions
              status={state.shiftStatus}
              onPause={handlePause}
              onPhotoReport={handlePhotoReport}
              onCallManager={handleCallManager}
              loading={state.isLoading}
            />

            <EarningsToday
              todayEarnings={state.todayEarnings}
              todayHours={state.todayHours}
            />

            <HistoryMini
              history={mockHistory}
              onShowAll={() => toast({ title: "История", description: "Показать все смены" })}
            />
          </>
        )}

        {tab === 'tasks' && (
          <>
            <CurrentTaskCard
              task={state.currentTask}
              onStartTask={handleStartTask}
              onCompleteTask={handleCompleteTask}
              onMoveStart={handleMoveStart}
              loading={state.isLoading}
            />

            {/* Список всех задач */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Все задачи</h3>
              {state.tasks.map((task) => (
                <div key={task.id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-slate-500">{task.address}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-11"
                        onClick={() => handleMoveStart(task.id)}
                        disabled={state.isLoading}
                      >
                        <Truck className="w-4 h-4 mr-1" />
                        В путь
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Нижняя закреплённая панель */}
      <div className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-sm px-4 pb-[calc(env(safe-area-inset-bottom,0)+16px)]">
        <Button
          size="xl"
          className="w-full shadow-lg"
          variant={state.shiftStatus === 'running' ? 'destructive' : 'default'}
          onClick={handleMainAction}
          disabled={state.isLoading}
        >
          {mainCtaLabel(state.shiftStatus, state.outside)}
        </Button>
      </div>
    </div>
  );
}