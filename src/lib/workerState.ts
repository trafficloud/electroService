import { useReducer, useCallback } from 'react';

export type ShiftStatus = 'idle' | 'running' | 'pause';

export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  priority: TaskPriority;
  address: string;
  estimateHrs?: number;
  materials: { name: string; qty: number; unit?: string }[];
  coords?: { lat: number; lng: number };
  status?: 'pending' | 'in_progress' | 'completed';
};

export type WorkerState = {
  shiftStatus: ShiftStatus;
  geoVerified: boolean;
  outside: boolean;
  currentSeconds: number;
  todayEarnings: number;
  todayHours: number;
  currentTask: Task | null;
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
};

export type WorkerAction =
  | { type: 'START_SHIFT' }
  | { type: 'END_SHIFT' }
  | { type: 'PAUSE_SHIFT' }
  | { type: 'RESUME_SHIFT' }
  | { type: 'UPDATE_TIMER'; payload: number }
  | { type: 'SET_GEO_STATUS'; payload: { verified: boolean; outside: boolean } }
  | { type: 'START_TASK'; payload: string }
  | { type: 'COMPLETE_TASK'; payload: string }
  | { type: 'MOVE_START'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'PHOTO_REPORT' }
  | { type: 'CALL_MANAGER' };

const initialState: WorkerState = {
  shiftStatus: 'idle',
  geoVerified: true,
  outside: false,
  currentSeconds: 0,
  todayEarnings: 5200,
  todayHours: 7,
  currentTask: {
    id: '1',
    title: 'Штробим стену',
    priority: 'medium',
    address: 'ул. Пушкина, 10',
    estimateHrs: 0.5,
    materials: [
      { name: 'кабель ВВГнг-LS 2×2,5', qty: 25, unit: 'м' },
      { name: 'клипсы', qty: 30, unit: 'шт' }
    ],
    status: 'pending'
  },
  tasks: [
    {
      id: '2',
      title: 'Подрозетники (2шт)',
      priority: 'low',
      address: 'ул. Пушкина, 10',
      materials: []
    },
    {
      id: '3',
      title: 'Прокладка кабеля',
      priority: 'high',
      address: 'ул. Пушкина, 10',
      materials: []
    },
    {
      id: '4',
      title: 'Сборка щита',
      priority: 'medium',
      address: 'ул. Пушкина, 10',
      materials: []
    }
  ],
  isLoading: false,
  error: null,
};

function workerReducer(state: WorkerState, action: WorkerAction): WorkerState {
  switch (action.type) {
    case 'START_SHIFT':
      return {
        ...state,
        shiftStatus: 'running',
        currentSeconds: 0,
        error: null,
      };
    
    case 'END_SHIFT':
      return {
        ...state,
        shiftStatus: 'idle',
        currentSeconds: 0,
        error: null,
      };
    
    case 'PAUSE_SHIFT':
      return {
        ...state,
        shiftStatus: 'pause',
        error: null,
      };
    
    case 'RESUME_SHIFT':
      return {
        ...state,
        shiftStatus: 'running',
        error: null,
      };
    
    case 'UPDATE_TIMER':
      return {
        ...state,
        currentSeconds: action.payload,
      };
    
    case 'SET_GEO_STATUS':
      return {
        ...state,
        geoVerified: action.payload.verified,
        outside: action.payload.outside,
      };
    
    case 'START_TASK':
      return {
        ...state,
        currentTask: state.currentTask?.id === action.payload 
          ? { ...state.currentTask, status: 'in_progress' }
          : state.currentTask,
        error: null,
      };
    
    case 'COMPLETE_TASK':
      return {
        ...state,
        currentTask: state.currentTask?.id === action.payload 
          ? { ...state.currentTask, status: 'completed' }
          : state.currentTask,
        error: null,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    default:
      return state;
  }
}

export function useWorkerState() {
  const [state, dispatch] = useReducer(workerReducer, initialState);

  const actions = {
    startShift: useCallback(() => dispatch({ type: 'START_SHIFT' }), []),
    endShift: useCallback(() => dispatch({ type: 'END_SHIFT' }), []),
    pauseShift: useCallback(() => dispatch({ type: 'PAUSE_SHIFT' }), []),
    resumeShift: useCallback(() => dispatch({ type: 'RESUME_SHIFT' }), []),
    updateTimer: useCallback((seconds: number) => dispatch({ type: 'UPDATE_TIMER', payload: seconds }), []),
    setGeoStatus: useCallback((verified: boolean, outside: boolean) => 
      dispatch({ type: 'SET_GEO_STATUS', payload: { verified, outside } }), []),
    startTask: useCallback((taskId: string) => dispatch({ type: 'START_TASK', payload: taskId }), []),
    completeTask: useCallback((taskId: string) => dispatch({ type: 'COMPLETE_TASK', payload: taskId }), []),
    moveStart: useCallback((taskId: string) => dispatch({ type: 'MOVE_START', payload: taskId }), []),
    setLoading: useCallback((loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }), []),
    setError: useCallback((error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }), []),
    photoReport: useCallback(() => dispatch({ type: 'PHOTO_REPORT' }), []),
    callManager: useCallback(() => dispatch({ type: 'CALL_MANAGER' }), []),
  };

  return { state, actions };
}

// Вспомогательные функции
export function mainCtaLabel(status: ShiftStatus, outside: boolean): string {
  if (status === 'idle') return outside ? 'Начать (unverified)' : 'Начать работу';
  if (status === 'running') return 'Завершить смену';
  return 'Вернуться к работе';
}

export function geoBadgeText(geoVerified: boolean, outside: boolean): string {
  if (!geoVerified) return 'gps off';
  return outside ? 'вне зоны' : 'verified';
}

export function formatTime(seconds: number): string {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function getStatusLabel(status: ShiftStatus): string {
  switch (status) {
    case 'running': return 'Смена идёт';
    case 'pause': return 'Пауза';
    default: return 'Смена не начата';
  }
}

export function getPriorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case 'high': return 'Высокий';
    case 'medium': return 'Средний';
    case 'low': return 'Низкий';
    default: return 'Средний';
  }
}