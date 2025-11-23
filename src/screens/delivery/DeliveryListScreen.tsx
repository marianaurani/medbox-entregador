// src/screens/delivery/DeliveryListScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useDelivery } from '../../contexts/DeliveryContext';
import colors from '../../constants/colors';

type TabType = 'disponiveis' | 'em_andamento' | 'finalizadas';

type DeliveryStackParamList = {
  DeliveryList: undefined;
  DeliveryDetails: { deliveryId: string };
  DeliveryInProgress: { deliveryId: string };
};

const DeliveryListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<DeliveryStackParamList>>();
  const {
    getAvailableDeliveries,
    getOngoingDeliveries,
    getCompletedDeliveries,
    acceptDelivery,
  } = useDelivery();

  const [activeTab, setActiveTab] = useState<TabType>('disponiveis');
  const [isAccepting, setIsAccepting] = useState<string | null>(null);

  const availableDeliveries = getAvailableDeliveries();
  const ongoingDeliveries = getOngoingDeliveries();
  const completedDeliveries = getCompletedDeliveries();

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const formatDistance = (distance: number) => {
    return `${distance.toFixed(1)} km`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel':
        return colors.available;
      case 'aceito':
        return colors.accepted;
      case 'em_rota':
        return colors.inProgress;
      case 'entregue':
        return colors.delivered;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'disponivel':
        return 'Disponível';
      case 'aceito':
        return 'Aceito';
      case 'coletado':
        return 'Coletado';
      case 'em_rota':
        return 'Em Rota';
      case 'entregue':
        return 'Entregue';
      default:
        return status;
    }
  };

  const handleAcceptDelivery = async (deliveryId: string) => {
    Alert.alert(
      'Aceitar Pedido',
      'Deseja aceitar este pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar',
          onPress: async () => {
            try {
              setIsAccepting(deliveryId);
              await acceptDelivery(deliveryId);
              Alert.alert('Sucesso!', 'Pedido aceito com sucesso!', [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.navigate('DeliveryInProgress', { deliveryId });
                  },
                },
              ]);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível aceitar o pedido. Tente novamente.');
            } finally {
              setIsAccepting(null);
            }
          },
        },
      ]
    );
  };

  const handleCardPress = (deliveryId: string, status: string) => {
    if (status === 'disponivel') {
      handleAcceptDelivery(deliveryId);
    } else if (status === 'aceito' || status === 'coletado' || status === 'em_rota') {
      navigation.navigate('DeliveryInProgress', { deliveryId });
    } else {
      navigation.navigate('DeliveryDetails', { deliveryId });
    }
  };

  const handleContinueDelivery = (deliveryId: string) => {
    navigation.navigate('DeliveryInProgress', { deliveryId });
  };

  const renderDeliveryCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.deliveryCard}
      activeOpacity={0.7}
      onPress={() => handleCardPress(item.id, item.status)}
    >
      {/* Header do Card */}
      <View style={styles.cardHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>{item.orderId}</Text>
          {item.status !== 'disponivel' && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.deliveryFee}>{formatCurrency(item.deliveryFee)}</Text>
      </View>

      {/* Origem - Farmácia */}
      <View style={styles.locationContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="storefront" size={20} color={colors.primary} />
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>ORIGEM</Text>
          <Text style={styles.locationName}>{item.pharmacy.name}</Text>
          <Text style={styles.locationAddress}>{item.pharmacy.address}</Text>
        </View>
      </View>

      {/* Linha conectora */}
      <View style={styles.connector} />

      {/* Destino - Cliente */}
      <View style={styles.locationContainer}>
        <View style={[styles.iconContainer, { backgroundColor: colors.medboxLightGreen }]}>
          <Ionicons name="location" size={20} color={colors.error} />
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>DESTINO</Text>
          <Text style={styles.locationName}>{item.customer.name}</Text>
          <Text style={styles.locationAddress}>{item.customer.address}</Text>
        </View>
      </View>

      {/* Footer do Card */}
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="navigate-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.footerText}>{formatDistance(item.distance)}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.footerText}>{item.estimatedTime} min</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="cube-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.footerText}>{item.items.length} itens</Text>
        </View>
      </View>

      {/* Botão de Ação */}
      {item.status === 'disponivel' && (
        <TouchableOpacity
          style={[styles.acceptButton, isAccepting === item.id && styles.acceptButtonDisabled]}
          onPress={() => handleAcceptDelivery(item.id)}
          disabled={isAccepting === item.id}
        >
          <Text style={styles.acceptButtonText}>
            {isAccepting === item.id ? 'Aceitando...' : 'Aceitar Pedido'}
          </Text>
        </TouchableOpacity>
      )}

      {(item.status === 'aceito' || item.status === 'coletado' || item.status === 'em_rota') && (
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => handleContinueDelivery(item.id)}
        >
          <Text style={styles.continueButtonText}>Continuar Entrega</Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const getCurrentList = () => {
    switch (activeTab) {
      case 'disponiveis':
        return availableDeliveries;
      case 'em_andamento':
        return ongoingDeliveries;
      case 'finalizadas':
        return completedDeliveries;
      default:
        return [];
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pedidos</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'disponiveis' && styles.tabActive]}
          onPress={() => setActiveTab('disponiveis')}
        >
          <Text style={[styles.tabText, activeTab === 'disponiveis' && styles.tabTextActive]}>
            Disponíveis
          </Text>
          {availableDeliveries.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{availableDeliveries.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, styles.tabWide, activeTab === 'em_andamento' && styles.tabActive]}
          onPress={() => setActiveTab('em_andamento')}
        >
          <Text 
            style={[styles.tabText, activeTab === 'em_andamento' && styles.tabTextActive]}
            numberOfLines={1}
          >
            Em Andamento
          </Text>
          {ongoingDeliveries.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{ongoingDeliveries.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'finalizadas' && styles.tabActive]}
          onPress={() => setActiveTab('finalizadas')}
        >
          <Text style={[styles.tabText, activeTab === 'finalizadas' && styles.tabTextActive]}>
            Entregues
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Pedidos */}
      <FlatList
        data={getCurrentList()}
        renderItem={renderDeliveryCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bicycle-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'disponiveis'
                ? 'Novos pedidos aparecerão aqui'
                : activeTab === 'em_andamento'
                ? 'Você não tem entregas em andamento'
                : 'Histórico vazio'}
            </Text>
          </View>
        }
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 6,
    minWidth: 0,
  },
  tabWide: {
    flex: 1.3,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    flexShrink: 1,
  },
  tabTextActive: {
    color: 'white',
  },
  badge: {
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  deliveryCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  deliveryFee: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.medboxLightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 2,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  connector: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginLeft: 19,
    marginVertical: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  acceptButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  acceptButtonDisabled: {
    opacity: 0.6,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: colors.info,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default DeliveryListScreen;