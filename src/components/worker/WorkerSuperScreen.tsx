import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase, getCurrentLocation, formatLocation, signOut, calculateDistance, parseCoordinates, hasValidCredentials } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import { WorkSession, Task } from '../../types';
import { HeaderStatus } from './HeaderStatus';
import { ShiftCard } from './ShiftCard';
import { QuickActions } from './QuickActions';
import { CurrentTaskCard } from './CurrentTaskCard';
import { EarningsToday } from './EarningsToday';
import { HistoryMini } from './HistoryMini';
import { Button } from '../ui/button';
import { Truck } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';

type ShiftStatus = 'idle' | 'running' | 'pause';

interface HistoryEntry {
  date: string;
  hours: number;
  earnings: number;
}

export function WorkerSuperScreen() {
  const { profile } = useAuth();
  const { toast } = useToast();

  if (!hasValidCredentials || !supabase) {
    return (
      <div className="min-h-screen w-full bg-white text-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ошибка конфигурации</h2>
          <p className="text-gray-600">Система не настроена для работы с базой данных</p>
        </div>
      </div>
    );
  }
  
  // State management
  const [currentSession, setCurrentSession] = useState<WorkSession | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayHours, setTodayHours] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tab, setTab] = useState<'time' | 'tasks'>('time');
  const [geoVerified, setGeoVerified] = useState(true);
  const [outside, setOutside] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update shift timer
  useEffect(() => {
    if (currentSession && !currentSession.end_time) {
      const timer = setInterval(() => {
        const startTime = new Date(currentSession.start_time);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setCurrentSeconds(seconds);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentSession]);

  // Initialize data on component mount
  useEffect(() => {
    if (profile) {
      initializeData();
    }
  }, [profile]);

  const initializeData = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchCurrentSession(),
        fetchTasks(),
        fetchTodayStats(),
        fetchHistory()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSession = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('work_sessions')
      .select('*')
      .eq('user_id', profile.id)
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setCurrentSession(data);
    }
  };

  const fetchTasks = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:assigned_to(id, full_name, email),
        creator:created_by(id, full_name, email),
        task_materials(
          id,
          quantity_needed,
          quantity_used,
          material:material_id(id, name, default_unit, cost_per_unit)
        )
      `)
      .eq('assigned_to', profile.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTasks(data);
      // Set current task to the first in-progress or pending task
      const activeTask = data.find(task => 
        task.status === 'in_progress' || task.status === 'pending' || task.status === 'paused'
      );
      setCurrentTask(activeTask || null);
    }
  };

  const fetchTodayStats = async () => {
    if (!profile) return;

    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const { data, error } = await supabase
      .from('work_sessions')
      .select('total_hours, earnings')
      .eq('user_id', profile.id)
      .not('end_time', 'is', null)
      .gte('start_time', startOfToday.toISOString())
      .lte('start_time', endOfToday.toISOString());

    if (!error && data) {
      const totalHours = data.reduce((sum, session) => sum + (session.total_hours || 0), 0);
      const totalEarnings = data.reduce((sum, session) => sum + (session.earnings || 0), 0);
      setTodayHours(totalHours);
      setTodayEarnings(totalEarnings);
    }
  };

  const fetchHistory = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('work_sessions')
      .select('start_time, total_hours, earnings')
      .eq('user_id', profile.id)
      .not('end_time', 'is', null)
      .order('start_time', { ascending: false })
      .limit(10);

    if (!error && data) {
      const historyEntries = data.map(session => ({
        date: format(new Date(session.start_time), 'dd.MM'),
        hours: session.total_hours || 0,
        earnings: session.earnings || 0,
      }));
      setHistory(historyEntries);
    }
  };

  const getShiftStatus = (): ShiftStatus => {
    if (!currentSession) return 'idle';
    if (currentSession.end_time) return 'idle';
    // You could add pause logic here if needed
    return 'running';
  };

  const formatTime = (seconds: number): string => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const startWork = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      let location = null;
      
      try {
        const position = await getCurrentLocation();
        location = formatLocation(position);
        setGeoVerified(true);
        setOutside(false);
      } catch (locationError) {
        console.warn('Geolocation failed:', locationError);
        setGeoVerified(false);
        const proceed = confirm(
          'Не удалось получить GPS координаты. Продолжить без записи местоположения?'
        );
        if (!proceed) {
          return;
        }
      }

      const { data, error } = await supabase
        .from('work_sessions')
        .insert({
          user_id: profile.id,
          start_time: new Date().toISOString(),
          start_location: location,
        })
        .select()
        .single();

      if (error) throw error;
      
      setCurrentSession(data);
      setCurrentSeconds(0);
      
      toast({
        title: "Смена началась",
        description: "Удачной работы!",
        variant: "success",
      });

      // Auto-start first pending task if available
      if (currentTask && currentTask.status === 'pending') {
        setTimeout(() => {
          if (confirm(`Начать работу над задачей "${currentTask.title}"?`)) {
            startTask(currentTask.id);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error starting work:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось начать смену",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const endWork = async () => {
    if (!currentSession || !profile) return;

    // Check if there's an active task
    if (currentTask && currentTask.status === 'in_progress') {
      const shouldContinue = confirm(
        'У вас есть активная задача. Завершить смену без завершения задачи?'
      );
      if (!shouldContinue) return;
    }

    setLoading(true);
    try {
      let location = null;
      
      try {
        const position = await getCurrentLocation();
        location = formatLocation(position);
      } catch (locationError) {
        console.warn('Geolocation failed:', locationError);
      }
      
      const endTime = new Date();
      const startTime = new Date(currentSession.start_time);
      const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      const earnings = totalHours * (profile.hourly_rate || 0);

      const { error } = await supabase
        .from('work_sessions')
        .update({
          end_time: endTime.toISOString(),
          end_location: location,
          total_hours: totalHours,
          earnings: earnings,
        })
        .eq('id', currentSession.id);

      if (error) throw error;
      
      setCurrentSession(null);
      setCurrentSeconds(0);
      
      // Refresh today's stats
      await fetchTodayStats();
      await fetchHistory();
      
      toast({
        title: "Смена завершена",
        description: `Сегодня: ${totalHours.toFixed(1)} ч • ${earnings.toFixed(0)} ₽`,
        variant: "success",
      });
    } catch (error) {
      console.error('Error ending work:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось завершить смену",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const pauseShift = async () => {
    toast({
      title: "Перерыв",
      description: "Вы на перерыве. Не забудьте вернуться в работу.",
      variant: "default",
    });
  };

  const startTask = async (taskId: string) => {
    if (!profile) return;
    
    // Автоматически начинаем смену, если она не активна
    if (!currentSession) {
      await startWork();
      // Ждем немного для создания сессии
      setTimeout(() => startTask(taskId), 1000);
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Определяем, это новая задача или возобновление приостановленной
    const isResuming = task.status === 'paused';
    const newStatus = 'in_progress';

    // Check location if target_location is specified
    if (task.target_location) {
      try {
        const currentPosition = await getCurrentLocation();
        const currentCoords = {
          lat: currentPosition.coords.latitude,
          lon: currentPosition.coords.longitude
        };
        
        const targetCoords = parseCoordinates(task.target_location);
        
        if (targetCoords) {
          const distance = calculateDistance(
            currentCoords.lat,
            currentCoords.lon,
            targetCoords.lat,
            targetCoords.lon
          );
          
          // If distance is more than 100 meters, show warning
          if (distance > 100) {
            const shouldContinue = confirm(
              `Вы находитесь на расстоянии ${Math.round(distance)} м от объекта задачи.\n\nПродолжить выполнение задачи?`
            );
            if (!shouldContinue) {
              return;
            }
          } else {
            toast({
              title: "Местоположение подтверждено",
              description: `Вы находитесь в ${Math.round(distance)} м от объекта`,
              variant: "success",
            });
          }
        }
      } catch (locationError) {
        console.warn('Location check failed:', locationError);
        const shouldContinue = confirm(
          'Не удалось проверить ваше местоположение. Продолжить без проверки?'
        );
        if (!shouldContinue) {
          return;
        }
      }
    }
    setLoading(true);
    try {
      let location = null;
      let updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      
      try {
        const position = await getCurrentLocation();
        location = formatLocation(position);
      } catch (locationError) {
        console.warn('Geolocation failed:', locationError);
      }

      if (isResuming) {
        // Возобновляем приостановленную задачу
        updateData.paused_at = null;
        
        toast({
          title: "Задача возобновлена",
          description: "Продолжаем работу над задачей!",
          variant: "success",
        });
      } else {
        // Начинаем новую задачу
        updateData.started_at = new Date().toISOString();
        updateData.start_location = location;
        
        toast({
          title: "Задача в работе",
          description: "Задача взята в работу!",
          variant: "success",
        });
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;
      
      await fetchTasks();
    } catch (error) {
      console.error('Error starting task:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось начать задачу",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    setLoading(true);
    try {
      let location = null;
      
      try {
        const position = await getCurrentLocation();
        location = formatLocation(position);
      } catch (locationError) {
        console.warn('Geolocation failed:', locationError);
      }

      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          end_location: location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;
      
      await fetchTasks();
      
      toast({
        title: "Задача завершена",
        description: "Задача успешно завершена!",
        variant: "success",
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось завершить задачу",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const moveStart = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Open maps with task location
    if (task.start_location) {
      const coords = task.start_location.split(',').map(c => parseFloat(c.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        const url = `https://maps.google.com/?q=${coords[0]},${coords[1]}`;
        window.open(url, '_blank');
      }
    } else {
      // Use task description or title as address
      const address = encodeURIComponent(task.description || task.title);
      const url = `https://maps.google.com/?q=${address}`;
      window.open(url, '_blank');
    }
    
    toast({
      title: "В путь",
      description: "Откроем маршрут и учтём дорогу.",
      variant: "success",
    });
  };

  const photoReport = async () => {
    toast({
      title: "Фото-отчёт",
      description: "Фото-отчёт отправлен!",
      variant: "success",
    });
  };

  const callManager = async () => {
    toast({
      title: "Звонок менеджеру",
      description: "Соединяем с менеджером...",
      variant: "default",
    });
  };

  const handleMainAction = async () => {
    const status = getShiftStatus();
    if (status === 'idle') {
      await startWork();
    } else {
      await endWork();
    }
  };

  const handleLogout = async () => {
    if (currentSession && !currentSession.end_time) {
      const shouldLogout = confirm(
        'У вас активная смена. Выйти из системы без завершения смены?'
      );
      if (!shouldLogout) return;
    }
    
    await signOut();
  };

  const shiftStatus = getShiftStatus();
  const mainCtaLabel = shiftStatus === 'idle' 
    ? (outside ? 'Начать (unverified)' : 'Начать работу')
    : 'Завершить смену';

  return (
    <div className="min-h-screen w-full bg-white text-slate-900">
      <HeaderStatus
        status={shiftStatus}
        geoVerified={geoVerified}
        outside={outside}
        currentTime={currentTime.toLocaleTimeString('ru-RU')}
        onLogout={handleLogout}
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
          <div className="text-sm text-slate-500">Добрый день, {profile?.full_name}!</div>
          <div className="ml-auto flex gap-2">
            <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium">
              Сегодня: <span className="font-bold">{todayEarnings.toLocaleString()} ₽</span>
            </div>
            <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium">
              <span className="font-bold">{todayHours.toFixed(1)} ч</span>
            </div>
          </div>
        </section>

        {tab === 'time' && (
          <>
            <ShiftCard
              status={shiftStatus}
              outside={outside}
              currentTime={formatTime(currentSeconds)}
              onMainAction={handleMainAction}
              loading={loading}
            />

            <QuickActions
              status={shiftStatus}
              onPause={pauseShift}
              onPhotoReport={photoReport}
              onCallManager={callManager}
              loading={loading}
            />

            <EarningsToday
              todayEarnings={todayEarnings}
              todayHours={todayHours}
            />

            <HistoryMini
              history={history}
              onShowAll={() => toast({ title: "История", description: "Показать все смены" })}
            />
          </>
        )}

        {tab === 'tasks' && (
          <>
            <CurrentTaskCard
              task={currentTask}
              onStartTask={startTask}
              onCompleteTask={completeTask}
              onMoveStart={moveStart}
              loading={loading}
            />

            {/* Список всех задач */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Все задачи</h3>
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>Нет назначенных задач</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-slate-500">{task.description}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          Статус: {
                            task.status === 'completed' ? 'Завершена' :
                            task.status === 'in_progress' ? 'В работе' :
                            task.status === 'paused' ? 'На паузе' : 'Ожидает'
                          }
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-11"
                          onClick={() => moveStart(task.id)}
                          disabled={loading}
                        >
                          <Truck className="w-4 h-4 mr-1" />
                          В путь
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* Нижняя закреплённая панель */}
      <div className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-sm px-4 pb-[calc(env(safe-area-inset-bottom,0)+16px)]">
        <Button
          size="xl"
          className="w-full shadow-lg"
          variant={shiftStatus === 'running' ? 'destructive' : 'default'}
          onClick={handleMainAction}
          disabled={loading}
        >
          {mainCtaLabel}
        </Button>
      </div>
    </div>
  );
}