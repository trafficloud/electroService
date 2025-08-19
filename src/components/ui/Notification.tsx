import React, { createContext, useContext, useState, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info';

type Notification = {
  id: number;
  message: string;
  type: NotificationType;
};

type ConfirmDialog = {
  id: number;
  message: string;
  resolve: (value: boolean) => void;
};

type NotificationContextType = {
  notify: (message: string, type?: NotificationType) => void;
  confirm: (message: string) => Promise<boolean>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const typeStyles: Record<NotificationType, string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirms, setConfirms] = useState<ConfirmDialog[]>([]);

  const notify = (message: string, type: NotificationType = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const confirm = (message: string) => {
    return new Promise<boolean>((resolve) => {
      const id = Date.now();
      setConfirms((prev) => [...prev, { id, message, resolve }]);
    });
  };

  const handleConfirm = (id: number, value: boolean) => {
    const dialog = confirms.find((c) => c.id === id);
    if (dialog) {
      dialog.resolve(value);
    }
    setConfirms((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify, confirm }}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`px-4 py-2 rounded shadow text-white ${typeStyles[n.type]}`}
          >
            {n.message}
          </div>
        ))}
      </div>
      {confirms.map((c) => (
        <div
          key={c.id}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <p className="mb-4 text-gray-800">{c.message}</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleConfirm(c.id, false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Нет
              </button>
              <button
                onClick={() => handleConfirm(c.id, true)}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Да
              </button>
            </div>
          </div>
        </div>
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

