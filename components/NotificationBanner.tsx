import React, { useEffect } from 'react';
import { Notification } from '../types';

interface NotificationBannerProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  const baseClasses = 'p-4 mb-4 text-sm rounded-lg flex items-center justify-between shadow-md';
  const typeClasses = {
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[notification.type]}`} role="alert">
      <span className="font-medium">{notification.message}</span>
      <button onClick={onClose} className="ml-4 -mr-1 -my-1 p-1.5 rounded-full hover:bg-white/30">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
        </svg>
      </button>
    </div>
  );
};

export default NotificationBanner;
