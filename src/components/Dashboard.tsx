import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { TimeTracker } from './TimeTracker';
import { TaskManager } from './TaskManager';
import { MaterialManager } from './MaterialManager';
import { TeamManager } from './TeamManager';
import { supabase } from '../lib/supabase';
import { 
  Clock, 
  CheckSquare, 
  Users, 
  Package, 
  BarChart3,
  Zap,
  Shield,
  Settings
} from 'lucide-react';

interface DashboardProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentView = 'dashboard', onNavigate }) => {
  const { profile } = useAuth();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Добро пожаловать';
    
    if (hour < 12) greeting = 'Доброе утро';
    else if (hour < 18) greeting = 'Добрый день';
    else greeting = 'Добрый вечер';

    return `${greeting}, ${profile?.full_name}!`;
  };

  const getQuickActions = () => {
    const actions = [];

    if (profile?.role === 'worker') {
      actions.push(
        { icon: Clock, label: 'Учет времени', description: 'Отметить начало/конец смены', color: 'bg-blue-500', view: 'time' },
        { icon: CheckSquare, label: 'Мои задачи', description: 'Просмотр назначенных задач', color: 'bg-green-500', view: 'tasks' }
      );
    }

    if (profile?.role === 'manager') {
      actions.push(
        { icon: CheckSquare, label: 'Управление задачами', description: 'Создание и назначение задач', color: 'bg-green-500', view: 'tasks' },
        { icon: Users, label: 'Команда', description: 'Управление сотрудниками', color: 'bg-purple-500', view: 'team' },
        { icon: Package, label: 'Материалы', description: 'Учет материалов и остатков', color: 'bg-orange-500', view: 'materials' }
      );
    }

    if (profile?.role === 'director') {
      actions.push(
        { icon: BarChart3, label: 'Аналитика', description: 'Отчеты и статистика', color: 'bg-indigo-500', view: 'analytics' },
        { icon: Users, label: 'Команда', description: 'Управление персоналом', color: 'bg-purple-500', view: 'team' },
        { icon: Package, label: 'Материалы', description: 'Контроль материалов', color: 'bg-orange-500', view: 'materials' }
      );
    }

    return actions;
  };

  return (
    <div className="space-y-8">
      {/* Render specific view content based on currentView */}
      {currentView === 'time' && profile?.role === 'worker' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Учет рабочего времени</h2>
          <TimeTracker />
        </div>
      )}

      {currentView === 'tasks' && (profile?.role === 'manager' || profile?.role === 'worker') && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {profile?.role === 'worker' ? 'Мои задачи' : 'Управление задачами'}
          </h2>
          <TaskManager />
        </div>
      )}

      {currentView === 'materials' && (profile?.role === 'manager' || profile?.role === 'director') && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Управление материалами</h2>
          <MaterialManager />
        </div>
      )}

      {currentView === 'team' && (profile?.role === 'manager' || profile?.role === 'director') && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Управление командой</h2>
          <TeamManager />
        </div>
      )}

      {currentView === 'analytics' && profile?.role === 'director' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Аналитика</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Аналитика</h3>
            <p className="text-gray-500">Раздел в разработке</p>
          </div>
        </div>
      )}

      {/* Default dashboard view */}
      {currentView === 'dashboard' && (
        <>
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{getWelcomeMessage()}</h1>
            <p className="text-blue-100 capitalize">
              {profile?.role === 'worker' && 'Рабочий'}
              {profile?.role === 'manager' && 'Менеджер'}
              {profile?.role === 'director' && 'Директор'}
              {profile?.role === 'admin' && 'Администратор'}
            </p>
          </div>
        </div>
        <p className="text-blue-100">
          Система управления электромонтажными работами
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getQuickActions().map((action, index) => (
            <div
              key={index}
              onClick={() => onNavigate?.(action.view)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{action.label}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Based on Role */}
      {profile?.role === 'worker' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Учет рабочего времени</h2>
          <TimeTracker />
        </div>
      )}

      {(profile?.role === 'manager' || profile?.role === 'worker') && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {profile?.role === 'worker' ? 'Мои задачи' : 'Управление задачами'}
          </h2>
          <TaskManager />
        </div>
      )}

      {profile?.role === 'director' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">24</div>
                <div className="text-sm text-gray-500">Активных сотрудников</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">156</div>
                <div className="text-sm text-gray-500">Завершенных задач</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">1,240</div>
                <div className="text-sm text-gray-500">Часов работы</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">89%</div>
                <div className="text-sm text-gray-500">Эффективность</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {profile?.role === 'admin' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Быстрые действия</h2>
          <AdminQuickActions onNavigate={onNavigate} />
        </div>
      )}
        </>
      )}
    </div>
  );
};

// Компонент быстрых действий для админа
interface AdminQuickActionsProps {
  onNavigate?: (view: string) => void;
}

const AdminQuickActions: React.FC<AdminQuickActionsProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    rolesChanged: 0,
    activeTasks: 0,
    systemStatus: 'Работает'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Получаем количество пользователей
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Получаем количество изменений ролей за последние 30 дней
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: rolesCount } = await supabase
        .from('role_change_logs')
        .select('*', { count: 'exact', head: true })
        .gte('changed_at', thirtyDaysAgo.toISOString());

      // Получаем количество активных задач
      const { count: tasksCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress']);

      setStats({
        totalUsers: usersCount || 0,
          systemStatus: 'Работает',
        rolesChanged: rolesCount || 0,
        activeTasks: tasksCount || 0,
        systemStatus: 'Работает'
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: Users,
      label: 'Пользователей',
      value: loading ? '-' : stats.totalUsers.toString(),
      color: 'bg-red-100 text-red-600',
      description: 'Всего в системе',
      onClick: () => onNavigate?.('admin')
    },
    {
      icon: Shield,
      label: 'Ролей изменено',
      value: loading ? '-' : stats.rolesChanged.toString(),
      color: 'bg-blue-100 text-blue-600',
      description: 'За последние 30 дней',
      onClick: () => onNavigate?.('admin')
    },
    {
      icon: CheckSquare,
      label: 'Активных задач',
      value: loading ? '-' : stats.activeTasks.toString(),
      color: 'bg-green-100 text-green-600',
      description: 'В работе и ожидают',
      onClick: () => onNavigate?.('tasks')
    },
    {
      icon: Settings,
      label: 'Система',
      value: stats.systemStatus,
      color: 'bg-purple-100 text-purple-600',
      description: 'Статус системы',
      onClick: () => onNavigate?.('admin')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {quickActions.map((action, index) => (
        <div
          key={index}
          onClick={action.onClick}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{action.value}</div>
              <div className="text-sm text-gray-500">{action.label}</div>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2">{action.description}</div>
        </div>
      ))}
    </div>
  );
};