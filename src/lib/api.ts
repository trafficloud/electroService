// Мок-API с имитацией задержек и ошибок сети

const DELAY_MIN = 150;
const DELAY_MAX = 500;
const ERROR_RATE = 0.05; // 5% шанс ошибки

function simulateDelay(): Promise<void> {
  const delay = Math.random() * (DELAY_MAX - DELAY_MIN) + DELAY_MIN;
  return new Promise(resolve => setTimeout(resolve, delay));
}

function shouldSimulateError(): boolean {
  return Math.random() < ERROR_RATE;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// API функции
export async function startShift(): Promise<{ success: boolean; message: string }> {
  await simulateDelay();
  
  if (shouldSimulateError()) {
    throw new ApiError('Не удалось начать смену. Проверьте соединение.');
  }
  
  return {
    success: true,
    message: 'Смена началась. Удачной работы!'
  };
}

export async function endShift(hours: number, earnings: number): Promise<{ success: boolean; message: string }> {
  await simulateDelay();
  
  if (shouldSimulateError()) {
    throw new ApiError('Не удалось завершить смену. Проверьте соединение.');
  }
  
  return {
    success: true,
    message: `Смена завершена. Сегодня: ${hours.toFixed(1)} ч • ${earnings.toFixed(0)} ₽`
  };
}

export async function pauseShift(): Promise<{ success: boolean; message: string }> {
  await simulateDelay();
  
  if (shouldSimulateError()) {
    throw new ApiError('Не удалось поставить на паузу. Проверьте соединение.');
  }
  
  return {
    success: true,
    message: 'Вы на перерыве. Не забудьте вернуться в работу.'
  };
}

export async function resumeShift(): Promise<{ success: boolean; message: string }> {
  await simulateDelay();
  
  if (shouldSimulateError()) {
    throw new ApiError('Не удалось возобновить работу. Проверьте соединение.');
  }
  
  return {
    success: true,
    message: 'Работа возобновлена!'
  };
}

export async function moveStart(taskId: string): Promise<{ success: boolean; message: string }> {
  await simulateDelay();
  
  if (shouldSimulateError()) {
    throw new ApiError('Не удалось отправить. Проверьте соединение.');
  }
  
  console.log(`move_start called for task: ${taskId}`);
  
  return {
    success: true,
    message: 'Откроем маршрут и учтём дорогу.'
  };
}

export async function startTask(taskId: string): Promise<{ success: boolean; message: string }> {
  await simulateDelay();
  
  if (shouldSimulateError()) {
    throw new ApiError('Не удалось начать задачу. Проверьте соединение.');
  }
  
  return {
    success: true,
    message: 'Задача взята в работу!'
  };
}

export async function completeTask(taskId: string): Promise<{ success: boolean; message: string }> {
  await simulateDelay();
  
  if (shouldSimulateError()) {
    throw new ApiError('Не удалось завершить задачу. Проверьте соединение.');
  }
  
  return {
    success: true,
    message: 'Задача завершена!'
  };
}

export async function photoReport(): Promise<{ success: boolean; message: string }> {
  await simulateDelay();
  
  if (shouldSimulateError()) {
    throw new ApiError('Не удалось отправить фото. Проверьте соединение.');
  }
  
  return {
    success: true,
    message: 'Фото-отчёт отправлен!'
  };
}

export async function callManager(): Promise<{ success: boolean; message: string }> {
  await simulateDelay();
  
  if (shouldSimulateError()) {
    throw new ApiError('Не удалось соединиться. Проверьте соединение.');
  }
  
  return {
    success: true,
    message: 'Соединяем с менеджером...'
  };
}

// Функция для открытия карт (имитация)
export function openMaps(coords?: { lat: number; lng: number }, address?: string): void {
  if (coords) {
    // Попытка открыть системные карты с координатами
    const url = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
    window.open(url, '_blank');
  } else if (address) {
    // Поиск по адресу
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.google.com/?q=${encodedAddress}`;
    window.open(url, '_blank');
  }
}