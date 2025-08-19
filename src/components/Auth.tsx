import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn, signUp, hasValidCredentials } from '../lib/supabase';
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react';

const authSchema = z.object({
  email: z.string()
    .email('Некорректный email')
    .refine(
      (email) => !email.endsWith('@example.com') && !email.endsWith('@test.com'),
      'Используйте реальный email-адрес (не example.com или test.com)'
    ),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  fullName: z.string().min(2, 'Имя должно содержать минимум 2 символа').optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

const ConfigWarning: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div className="max-w-md w-full">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mx-auto mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Конфигурация не найдена</h1>
        <p className="text-gray-600 mb-4">
          Для работы системы необходимо настроить подключение к Supabase.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-left text-sm">
          <p className="font-medium mb-2">Необходимо:</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-600">
            <li>Создать проект в Supabase</li>
            <li>Скопировать URL и Anon Key</li>
            <li>Настроить переменные окружения</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
);

export const Auth: React.FC = () => {

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await signUp(data.email, data.password, data.fullName || '');
        if (error) throw error;
      } else {
        const { error } = await signIn(data.email, data.password);
        if (error) throw error;
      }
    } catch (err: any) {
      let errorMessage = 'Произошла ошибка';
      
      if (err.message?.includes('email_address_invalid')) {
        errorMessage = 'Недопустимый email-адрес. Используйте реальный email (например, Gmail, Yandex, Mail.ru)';
      } else if (err.message?.includes('email_not_confirmed')) {
        errorMessage = 'Email не подтвержден. Проверьте почту и перейдите по ссылке подтверждения';
      } else if (err.message?.includes('invalid_credentials')) {
        errorMessage = 'Неверный email или пароль';
      } else if (err.message?.includes('Database error')) {
        errorMessage = 'Ошибка базы данных. Обратитесь к администратору';
      } else {
        errorMessage = err.message || 'Произошла ошибка';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    reset();
  };

  const AuthForm: React.FC = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ЭлектроСервис</h1>
            <p className="text-gray-600 mt-2">
              {isSignUp ? 'Создание аккаунта' : 'Вход в систему'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Полное имя
                </label>
                <input
                  {...register('fullName')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Введите ваше имя"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="example@company.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Введите пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isSignUp ? 'Создать аккаунт' : 'Войти'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignUp
                ? 'Уже есть аккаунт? Войти'
                : 'Нет аккаунта? Зарегистрироваться'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return hasValidCredentials ? <AuthForm /> : <ConfigWarning />;
};
