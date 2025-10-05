import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface NotificationContextValue {
  notifications: Notification[];
  showNotification: (type: Notification['type'], message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export { NotificationContext };

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showNotification = useCallback((type: Notification['type'], message: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    // Duraciones diferentes según el tipo de notificación
    const defaultDuration = type === 'success' ? 3000 : type === 'error' ? 6000 : 4000;
    const finalDuration = duration !== undefined ? duration : defaultDuration;
    
    const notification: Notification = { id, type, message, duration: finalDuration };
    
    setNotifications(prev => [...prev, notification]);

    if (finalDuration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, finalDuration);
    }
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const context = useContext(NotificationContext);
  if (!context) return null;
  
  const { notifications, removeNotification } = context;

  if (notifications.length === 0) return null;

  return (
    // Desktop: anchored to right with max width; Mobile: centered with horizontal padding
    <div className="fixed top-4 left-0 right-0 z-50 flex items-start justify-center pointer-events-none">
  {/* Mobile: full width minus gap; Desktop: wider fixed/min width for better readability */}
  <div className="space-y-3 w-[calc(100%-32px)] sm:w-[min(960px,calc(100%-64px))] lg:w-[min(1150px,calc(100%-128px))] px-4 sm:px-0 pointer-events-auto">
      {notifications.map((notification: Notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
      </div>
    </div>
  );
};

const NotificationItem: React.FC<{
  notification: Notification;
  onRemove: (id: string) => void;
}> = ({ notification, onRemove }) => {
  const [isPaused, setIsPaused] = React.useState(false);
  
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-kodigo-primary" />;
    }
  };

  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-white',
          border: 'border-l-4 border-l-emerald-500 border-r border-t border-b border-gray-200',
          shadow: 'shadow-lg drop-shadow-sm hover:shadow-xl',
          iconBg: 'bg-emerald-50'
        };
      case 'error':
        return {
          bg: 'bg-white',
          border: 'border-l-4 border-l-red-500 border-r border-t border-b border-gray-200',
          shadow: 'shadow-lg drop-shadow-sm hover:shadow-xl',
          iconBg: 'bg-red-50'
        };
      case 'info':
        return {
          bg: 'bg-white',
          border: 'border-l-4 border-l-kodigo-primary border-r border-t border-b border-gray-200',
          shadow: 'shadow-lg drop-shadow-sm hover:shadow-xl',
          iconBg: 'bg-kodigo-light/20'
        };
    }
  };

  const styles = getStyles();

  return (
    <div 
      className={`w-full max-w-full ${styles.bg} ${styles.border} ${styles.shadow} rounded-r-lg backdrop-blur-sm animate-slide-in-right overflow-hidden transition-all duration-300 hover:scale-[1.02]`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${styles.iconBg} rounded-full p-2`}>
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 leading-relaxed">
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onRemove(notification.id)}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-kodigo-primary/20 rounded-full p-1 transition-colors duration-200 hover:bg-gray-100"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Barra de progreso para mostrar tiempo restante */}
      <div className="h-1 bg-gray-100">
        <div 
          className={`h-full transition-all duration-300 ease-out ${
            notification.type === 'success' ? 'bg-emerald-500' :
            notification.type === 'error' ? 'bg-red-500' : 'bg-kodigo-primary'
          }`}
          style={{
            animation: `shrink ${notification.duration || 5000}ms linear forwards`,
            animationPlayState: isPaused ? 'paused' : 'running'
          }}
        />
      </div>
    </div>
  );
};