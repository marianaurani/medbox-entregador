// src/screens/menu/NotificationsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from '../../constants/colors';

type NotificationType = 'delivery' | 'payment' | 'system' | 'promotion';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Mock de notificações
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'delivery',
    title: 'Nova entrega disponível',
    message: 'Pedido #12345 aguardando aceite. Distância: 2.5 km',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min atrás
    read: false,
  },
  {
    id: '2',
    type: 'payment',
    title: 'Pagamento recebido',
    message: 'Você recebeu R$ 15,00 pela entrega #12340',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
    read: false,
  },
  {
    id: '3',
    type: 'system',
    title: 'Atualização disponível',
    message: 'Nova versão do app disponível com melhorias de desempenho',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h atrás
    read: true,
  },
  {
    id: '4',
    type: 'promotion',
    title: 'Bônus especial!',
    message: 'Complete 5 entregas hoje e ganhe R$ 20,00 extras',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5h atrás
    read: true,
  },
  {
    id: '5',
    type: 'delivery',
    title: 'Entrega concluída',
    message: 'Pedido #12338 foi entregue com sucesso',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
    read: true,
  },
];

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [settings, setSettings] = useState({
    deliveries: true,
    payments: true,
    promotions: true,
    system: true,
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'delivery':
        return { name: 'cube-outline' as const, color: colors.info };
      case 'payment':
        return { name: 'cash-outline' as const, color: colors.success };
      case 'system':
        return { name: 'settings-outline' as const, color: colors.textSecondary };
      case 'promotion':
        return { name: 'gift-outline' as const, color: colors.warning };
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days}d atrás`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unreadNotification]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.notificationIcon, { backgroundColor: `${icon.color}15` }]}>
          <Ionicons name={icon.name} size={22} color={icon.color} />
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notificationTime}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>Preferências de Notificação</Text>
      
      <View style={styles.settingsCard}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="cube-outline" size={20} color={colors.info} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Novas Entregas</Text>
              <Text style={styles.settingSubtitle}>Avisos de pedidos disponíveis</Text>
            </View>
          </View>
          <Switch
            value={settings.deliveries}
            onValueChange={(value) => setSettings(prev => ({ ...prev, deliveries: value }))}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="white"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="cash-outline" size={20} color={colors.success} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Pagamentos</Text>
              <Text style={styles.settingSubtitle}>Confirmações de recebimento</Text>
            </View>
          </View>
          <Switch
            value={settings.payments}
            onValueChange={(value) => setSettings(prev => ({ ...prev, payments: value }))}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="white"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="gift-outline" size={20} color={colors.warning} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Promoções</Text>
              <Text style={styles.settingSubtitle}>Bônus e ofertas especiais</Text>
            </View>
          </View>
          <Switch
            value={settings.promotions}
            onValueChange={(value) => setSettings(prev => ({ ...prev, promotions: value }))}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="white"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Sistema</Text>
              <Text style={styles.settingSubtitle}>Atualizações e manutenções</Text>
            </View>
          </View>
          <Switch
            value={settings.system}
            onValueChange={(value) => setSettings(prev => ({ ...prev, system: value }))}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="white"
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Actions Bar */}
      {notifications.length > 0 && (
        <View style={styles.actionsBar}>
          <TouchableOpacity style={styles.actionButton} onPress={markAllAsRead}>
            <Ionicons name="checkmark-done-outline" size={18} color={colors.primary} />
            <Text style={styles.actionText}>Marcar todas como lidas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={clearAll}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>Limpar tudo</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          notifications.length > 0 && unreadCount > 0 ? (
            <View style={styles.unreadBanner}>
              <Ionicons name="notifications" size={16} color={colors.info} />
              <Text style={styles.unreadText}>
                {unreadCount} {unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>Nenhuma notificação</Text>
            <Text style={styles.emptySubtext}>
              Você está em dia! Novas notificações aparecerão aqui.
            </Text>
          </View>
        }
        ListFooterComponent={renderSettings()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },
  listContent: {
    flexGrow: 1,
  },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.medboxLightGreen,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
  },
  unreadText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.info,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  unreadNotification: {
    backgroundColor: colors.medboxLightGreen,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  settingsSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingsCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 12,
  },
});

export default NotificationsScreen;