import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { hasValidCredentials } from './lib/supabase';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = React.useState<string>('dashboard');

  // Show setup message if Supabase is not configured
  if (!hasValidCredentials) {
    console.log('App: Неверные учетные данные Supabase');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Настройка ЭлектроСервис
          </h1>
          <p className="text-gray-600 mb-6">
            Для работы приложения необходимо настроить подключение к Supabase.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Шаги настройки:</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Создайте проект в Supabase</li>
              <li>2. Скопируйте .env.example в .env</li>
              <li>3. Заполните VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY</li>
              <li>4. Перезапустите приложение</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }
  if (loading) {
    console.log('App: Состояние загрузки - пользователь:', !!user, 'профиль:', !!profile);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('App: Нет пользователя, показываем аутентификацию');
    return <Auth />;
  }

  console.log('App: Пользователь аутентифицирован, профиль:', profile);
  return (
    <Layout onNavigate={setCurrentView} currentView={currentView}>
      {(currentView === 'dashboard' || currentView === 'time' || currentView === 'tasks' || 
        currentView === 'materials' || currentView === 'team' || currentView === 'analytics') && 
        <Dashboard currentView={currentView} onNavigate={setCurrentView} />}
      {currentView === 'admin' && profile?.role === 'admin' && <AdminPanel />}
    </Layout>
  );
}

export default App;