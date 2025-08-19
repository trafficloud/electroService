import { useState, useEffect } from 'react';
import { User as AuthUser } from '@supabase/supabase-js';
import { supabase, hasValidCredentials } from '../lib/supabase';
import { logger } from '../lib/logger';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.log('useAuth: Запуск проверки аутентификации');
    logger.log('useAuth: Валидные учетные данные:', hasValidCredentials);
    if (!hasValidCredentials) {
      logger.log('useAuth: Нет валидных учетных данных, остановка');
      setLoading(false);
      return;
    }

    let mounted = true;

    const initAuth = async () => {
      try {
        logger.log('useAuth: Получение начальной сессии');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('useAuth: Ошибка сессии:', error);
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        logger.log('useAuth: Session result:', !!session);
        
        if (mounted) {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            logger.log('useAuth: User found, fetching profile...');
            fetchProfile(session.user.id);
          } else {
            logger.log('useAuth: No user found');
            setProfile(null);
            setLoading(false);
          }
        }
      } catch (error) {
        logger.error('useAuth: Init error:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    const fetchProfile = async (userId: string) => {
      try {
        logger.log('useAuth: Загрузка профиля для пользователя:', userId);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          logger.error('useAuth: Ошибка профиля:', error);
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        logger.log('useAuth: Профиль загружен:', data);
        if (mounted) {
          setProfile(data);
          setLoading(false);
        }
      } catch (error) {
        logger.error('useAuth: Ошибка загрузки профиля:', error);
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
        logger.log('useAuth: Состояние аутентификации изменилось:', event, !!session?.user);
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
