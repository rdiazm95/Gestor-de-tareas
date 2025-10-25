import React, { useState, useEffect } from 'react';
import socket from '../services/socket';
import { userService } from '../services/api';

const OnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    loadOnlineUsers();

    socket.on('userOnline', ({ userId, name }) => {
      setOnlineUsers(prev => {
        const exists = prev.find(u => u._id === userId);
        if (!exists) {
          return [...prev, { _id: userId, name, isOnline: true }];
        }
        return prev;
      });
    });

    socket.on('userOffline', ({ userId }) => {
      setOnlineUsers(prev => prev.filter(u => u._id !== userId));
    });

    return () => {
      socket.off('userOnline');
      socket.off('userOffline');
    };
  }, []);

  const loadOnlineUsers = async () => {
    try {
      const response = await userService.getAll();
      const online = response.data.filter(user => user.isOnline);
      setOnlineUsers(online);
    } catch (error) {
      console.error('Error al cargar usuarios conectados:', error);
    }
  };

  if (onlineUsers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
        Usuarios Conectados ({onlineUsers.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {onlineUsers.map(user => (
          <div
            key={user._id}
            className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {user.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsers;
