import { useState, useEffect } from 'react';
import { User as AuthUser } from '@supabase/supabase-js';
import { supabase, hasValidCredentials } from '../lib/supabase';
import { User } from '../types';

const isDev = import.meta.env.DEV;
const log = (...args: unknown[]) => {
  if (isDev) console.log(...args);
};
const logError = (...args: unknown[]) => {
  if (isDev) console.error(...args);
};

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    log('useAuth: Запуск проверки аутентификации');
    log('useAuth: Валидные учетные данные:', hasValidCredentials);
    if (!hasValidCredentials) {
      log('useAuth: Нет валидных учетных данных, остановка');
      setLoading(false);
      return;
    }

    let mounted = true;

    const initAuth = async () => {
      try {
        log('useAuth: Получение начальной сессии');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          logError('useAuth: Ошибка сессии:', error);
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        log('useAuth: Session result:', !!session);

        if (mounted) {
          setUser(session?.user ?? null);

          if (session?.user) {
            log('useAuth: User found, fetching profile...');
            fetchProfile(session.user.id);
          } else {
            log('useAuth: No user found');
            setProfile(null);
            setLoading(false);
          }
        }
      } catch (error) {
        logError('useAuth: Init error:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    const fetchProfile = async (userId: string) => {
      try {
        log('useAuth: Загрузка профиля для пользователя:', userId);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          logError('useAuth: Ошибка профиля:', error);
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        log('useAuth: Профиль загружен:', data);
        if (mounted) {
          setProfile(data);
          setLoading(false);
        }
      } catch (error) {
        logError('useAuth: Ошибка загрузки профиля:', error);
        if (mounted) {
          setProfile(null);
          setLoading(false);
        }
      }
    };

    // Инициализация
    initAuth();

    // Слушатель изменений аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        log('useAuth: Состояние аутентификации изменилось:', event, !!session?.user);
        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchProfile(session.user.id);
          } else {
            setProfile(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    loading,
    isWorker: profile?.role === 'worker',
    isManager: profile?.role === 'manager',
    isDirector: profile?.role === 'director',
    isAdmin: profile?.role === 'admin',
  };
};
