import React, { useState, useEffect, useRef } from 'react';
import { notificationService } from '../services/notificationService';
import socket from '../services/socket';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    setupSocketListeners();

    // Cerrar dropdown al hacer click fuera
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      socket.off('newNotification');
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getAll();
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error al cargar contador:', error);
    }
  };

  const setupSocketListeners = () => {
    socket.on('newNotification', () => {
      loadNotifications();
      loadUnreadCount();
      // Reproducir sonido de notificación
      playNotificationSound();
    });
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVKzn77BdGAg+ltryxnMpBSuBzvLZiTUIGWm98N+fUREMT6Pj8LljHAU4k9nzznopBSh+zPLeizsIGGW57OihUg4PWKni8bZlGwk7mdvyyXUpBSp/zvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsIGGS57OmiUREOV6jh8bhlHgk6l9vyyHUpBSqAzvLaiTYIGWi66+ifUhEMUKXi8bljHAU4k9nzznwqBSh+zPLeizsI');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('No se pudo reproducir sonido'));
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al marcar notificaciones');
    }
  };

  const handleDelete = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await notificationService.delete(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      loadUnreadCount();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar notificación');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }
    setShowDropdown(false);
    
    // Navegar a la tarea si existe
    if (notification.task) {
      navigate('/tasks');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'task_assigned': '📋',
      'task_comment': '💬',
      'task_updated': '✏️',
      'task_due_soon': '⏰',
      'task_completed': '✅'
    };
    return icons[type] || '📌';
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Ahora';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
    return `Hace ${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Campana */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Badge de contador */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Notificaciones {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Cargando notificaciones...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      {notification.task && (
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.task.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {getTimeAgo(notification.createdAt)}
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleDelete(notification._id, e)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
