// src/contexts/NotificationContext.tsx
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationType = 'delivery' | 'payment' | 'system' | 'promotion';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  deliveryId?: string;
  transactionId?: string;
  data?: any;
}

interface NotificationContextData {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
}

interface NotificationSettings {
  deliveries: boolean;
  payments: boolean;
  promotions: boolean;
  system: boolean;
}

// Valor padrão com todos os campos inicializados
const defaultContextValue: NotificationContextData = {
  notifications: [],
  unreadCount: 0,
  addNotification: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearAll: async () => {},
  deleteNotification: async () => {},
  settings: {
    deliveries: true,
    payments: true,
    promotions: true,
    system: true,
  },
  updateSettings: async () => {},
};

const NotificationContext = createContext<NotificationContextData>(defaultContextValue);

const STORAGE_KEY = '@entregador:notifications';
const SETTINGS_KEY = '@entregador:notification_settings';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    deliveries: true,
    payments: true,
    promotions: true,
    system: true,
  });

  useEffect(() => {
    loadNotifications();
    loadSettings();
  }, []);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(notificationsWithDates);
        console.log(`📬 [Notifications] ${notificationsWithDates.length} notificações carregadas`);
      }
    } catch (error) {
      console.error('❌ [Notifications] Erro ao carregar notificações:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('❌ [Notifications] Erro ao carregar configurações:', error);
    }
  };

  const saveNotifications = async (newNotifications: Notification[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotifications));
      setNotifications(newNotifications);
    } catch (error) {
      console.error('❌ [Notifications] Erro ao salvar notificações:', error);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('❌ [Notifications] Erro ao salvar configurações:', error);
    }
  };

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    // Verifica se o tipo de notificação está habilitado
    const typeKey = notification.type === 'delivery' ? 'deliveries' : notification.type + 's';
    if (!settings[typeKey as keyof NotificationSettings]) {
      console.log(`🔕 [Notifications] Notificação do tipo '${notification.type}' desabilitada`);
      return;
    }

    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    const updatedNotifications = [newNotification, ...notifications];
    
    // Limita a 100 notificações
    const limitedNotifications = updatedNotifications.slice(0, 100);
    
    await saveNotifications(limitedNotifications);
    console.log(`📬 [Notifications] Nova notificação adicionada: ${newNotification.title}`);
  }, [notifications, settings]);

  const markAsRead = useCallback(async (id: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    await saveNotifications(updatedNotifications);
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    await saveNotifications(updatedNotifications);
    console.log('✅ [Notifications] Todas marcadas como lidas');
  }, [notifications]);

  const clearAll = useCallback(async () => {
    await saveNotifications([]);
    console.log('🗑️ [Notifications] Todas limpas');
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== id);
    await saveNotifications(updatedNotifications);
  }, [notifications]);

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    await saveSettings(updated);
    console.log('⚙️ [Notifications] Configurações atualizadas');
  }, [settings]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        deleteNotification,
        settings,
        updateSettings,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};