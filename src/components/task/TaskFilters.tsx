import React from 'react';
import { Filter, Search } from 'lucide-react';

export type TaskFilter = 'all' | 'pending' | 'in_progress' | 'paused' | 'completed';

interface TaskFiltersProps {
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as TaskFilter)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Все задачи</option>
          <option value="pending">Ожидают</option>
          <option value="in_progress">В работе</option>
          <option value="paused">На паузе</option>
          <option value="completed">Завершены</option>
        </select>
      </div>

      <div className="flex-1 relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Поиск задач..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default TaskFilters;
