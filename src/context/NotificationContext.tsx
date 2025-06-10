import React, { createContext, useContext, useState } from 'react';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface NotificationContextType {
  showNotification: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {}
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (
    message: string, 
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Notification container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
        {notifications.map(notification => (
          <div 
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg min-w-[250px] transform transition-all duration-300 animate-slideIn ${
              notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'error' ? 'bg-red-500' :
              notification.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            } text-white`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};