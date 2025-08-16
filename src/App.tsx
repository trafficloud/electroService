import React from 'react';
import { useAuth } from './hooks/useAuth';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { WorkerSuperScreen } from './components/worker/WorkerSuperScreen';
import { AdminPanel } from './components/AdminPanel';
import { Toaster } from './components/ui/toaster';
import { hasValidCredentials } from './lib/supabase';

function App() {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = React.useState('dashboard');

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if user is not authenticated or no valid credentials
  if (!user || !hasValidCredentials) {
    return (
      <>
        <Auth />
        <Toaster />
      </>
    );
  }

  // Show admin panel for admin users
  if (profile?.role === 'admin' && currentView === 'admin') {
    return (
      <>
        <Layout currentView={currentView} onNavigate={setCurrentView}>
          <AdminPanel />
        </Layout>
        <Toaster />
      </>
    );
  }

  // Show worker super screen for workers
  if (profile?.role === 'worker') {
    return (
      <>
        <WorkerSuperScreen />
        <Toaster />
      </>
    );
  }

  // Show main layout for other roles (manager, director)
  return (
    <>
      <Layout currentView={currentView} onNavigate={setCurrentView}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Добро пожаловать!</h2>
          <p className="text-gray-600">Выберите раздел в навигации выше</p>
        </div>
      </Layout>
      <Toaster />
    </>
  );
}

export default App;