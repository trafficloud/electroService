import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase, getCurrentLocation, formatLocation } from '../lib/supabase';
import { WorkSession } from '../types';
import { Play, Square, Clock, MapPin, DollarSign, Calendar } from 'lucide-react';
import { format, formatDuration, intervalToDuration } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNotification } from './ui/Notification';

export const TimeTracker: React.FC = () => {
  const { profile } = useAuth();
  const [currentSession, setCurrentSession] = useState<WorkSession | null>(null);
  const [recentSessions, setRecentSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { notify } = useNotification();

  useEffect(() => {
    fetchCurrentSession();
    fetchRecentSessions();
    
    // Update current time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const fetchRecentSessions = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('work_sessions')
      .select('*')
      .eq('user_id', profile.id)
      .not('end_time', 'is', null)
      .order('start_time', { ascending: false })
      .limit(10);

    if (!error && data) {
      setRecentSessions(data);
    }
  };

  const startWork = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const position = await getCurrentLocation();
      const location = formatLocation(position);

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
    } catch (error) {
      console.error('Error starting work:', error);
      notify('Ошибка при начале работы. Проверьте доступ к геолокации.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const endWork = async () => {
    if (!currentSession || !profile) return;

    setLoading(true);
    try {
      const position = await getCurrentLocation();
      const location = formatLocation(position);
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
      fetchRecentSessions();
    } catch (error) {
      console.error('Error ending work:', error);
      notify('Ошибка при завершении работы. Проверьте доступ к геолокации.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSessionDuration = () => {
    if (!currentSession) return null;
    
    const start = new Date(currentSession.start_time);
    const duration = intervalToDuration({ start, end: currentTime });
    
    return formatDuration(duration, {
      format: ['hours', 'minutes', 'seconds'],
      locale: ru,
    });
  };

  const formatSessionDuration = (session: WorkSession) => {
    if (!session.total_hours) return '0 ч';
    
    const hours = Math.floor(session.total_hours);
    const minutes = Math.round((session.total_hours - hours) * 60);
    
    return `${hours}ч ${minutes}м`;
  };

  return (
    <div className="space-y-6">
      {/* Current Session Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Текущая смена</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{format(currentTime, 'HH:mm:ss', { locale: ru })}</span>
          </div>
        </div>

        {currentSession ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-green-800">Работаю</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-800">
                  {getCurrentSessionDuration()}
                </div>
                <div className="text-sm text-green-600">
                  Начал: {format(new Date(currentSession.start_time), 'HH:mm', { locale: ru })}
                </div>
              </div>
            </div>

            <button
              onClick={endWork}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Square className="w-5 h-5" />
              <span>Закончить работу</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-6">Смена не начата</p>
            </div>

            <button
              onClick={startWork}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Начать работу</span>
            </button>
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">История смен</h3>
        
        {recentSessions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Нет завершенных смен</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {format(new Date(session.start_time), 'dd MMM yyyy', { locale: ru })}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-4">
                      <span>
                        {format(new Date(session.start_time), 'HH:mm', { locale: ru })} - {' '}
                        {session.end_time && format(new Date(session.end_time), 'HH:mm', { locale: ru })}
                      </span>
                      {session.start_location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>GPS</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatSessionDuration(session)}
                  </div>
                  {session.earnings && (
                    <div className="text-sm text-green-600 flex items-center space-x-1">
                      <DollarSign className="w-3 h-3" />
                      <span>{session.earnings.toFixed(0)} ₽</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {recentSessions.reduce((acc, session) => acc + (session.total_hours || 0), 0).toFixed(1)}ч
              </div>
              <div className="text-sm text-gray-500">Всего часов</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {recentSessions.reduce((acc, session) => acc + (session.earnings || 0), 0).toFixed(0)} ₽
              </div>
              <div className="text-sm text-gray-500">Заработано</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {recentSessions.length}
              </div>
              <div className="text-sm text-gray-500">Смен</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};