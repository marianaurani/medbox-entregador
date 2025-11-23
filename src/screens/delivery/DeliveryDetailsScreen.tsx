// src/screens/delivery/DeliveryDetailsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDelivery } from '../../contexts/DeliveryContext';
import colors from '../../constants/colors';

type DeliveryStackParamList = {
  DeliveryList: undefined;
  DeliveryDetails: { deliveryId: string };
  DeliveryInProgress: { deliveryId: string };
};

type RouteParams = RouteProp<DeliveryStackParamList, 'DeliveryDetails'>;

const DeliveryDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const { deliveryId } = route.params;

  const { getDeliveryById } = useDelivery();
  const delivery = getDeliveryById(deliveryId);

  if (!delivery) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Pedido não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = () => {
    switch (delivery.status) {
      case 'disponivel':
        return colors.available;
      case 'aceito':
        return colors.accepted;
      case 'coletado':
        return colors.inProgress;
      case 'em_rota':
        return colors.inProgress;
      case 'entregue':
        return colors.delivered;
      case 'cancelado':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (delivery.status) {
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
      case 'cancelado':
        return 'Cancelado';
      default:
        return delivery.status;
    }
  };

  const getStatusIcon = () => {
    switch (delivery.status) {
      case 'disponivel':
        return 'hourglass-outline';
      case 'aceito':
        return 'checkmark-circle';
      case 'coletado':
        return 'cube';
      case 'em_rota':
        return 'bicycle';
      case 'entregue':
        return 'checkmark-done-circle';
      case 'cancelado':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const handleCallPhone = (phone: string, name: string) => {
    Alert.alert(
      'Ligar',
      `Deseja ligar para ${name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ligar',
          onPress: () => {
            Linking.openURL(`tel:${phone}`);
          },
        },
      ]
    );
  };

  const handleOpenMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Entrega</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Card Principal com Status */}
        <View style={styles.mainCard}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: getStatusColor() }
          ]}>
            <Ionicons
              name={getStatusIcon()}
              size={32}
              color="white"
            />
          </View>

          <Text style={styles.orderId}>{delivery.orderId}</Text>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusLabel()}</Text>
          </View>

          <Text style={styles.deliveryFee}>{formatCurrency(delivery.deliveryFee)}</Text>
        </View>

        {/* Informações da Entrega */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da Entrega</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID do Pedido</Text>
            <Text style={styles.infoValueMono}>{delivery.id}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {delivery.status === 'entregue' ? 'Entregue em' : 'Criado em'}
            </Text>
            <Text style={styles.infoValue}>
              {delivery.status === 'entregue' && delivery.deliveredAt 
                ? formatDate(delivery.deliveredAt)
                : delivery.createdAt 
                ? formatDate(delivery.createdAt) 
                : 'N/A'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="navigate" size={16} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Distância</Text>
            <Text style={styles.infoValue}>{delivery.distance.toFixed(1)} km</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="time" size={16} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Tempo Estimado</Text>
            <Text style={styles.infoValue}>{delivery.estimatedTime} min</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="cube" size={16} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Itens</Text>
            <Text style={styles.infoValue}>{delivery.items.length}</Text>
          </View>
        </View>

        {/* Card da Farmácia (Origem) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farmácia (Origem)</Text>

          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Ionicons name="storefront" size={24} color={colors.primary} />
              <Text style={styles.locationName}>{delivery.pharmacy.name}</Text>
            </View>

            <Text style={styles.locationAddress}>{delivery.pharmacy.address}</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleCallPhone(delivery.pharmacy.phone, delivery.pharmacy.name)}
              >
                <Ionicons name="call" size={18} color={colors.primary} />
                <Text style={styles.actionButtonText}>Ligar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleOpenMaps(delivery.pharmacy.address)}
              >
                <Ionicons name="navigate" size={18} color={colors.primary} />
                <Text style={styles.actionButtonText}>Abrir Mapa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Card do Cliente (Destino) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente (Destino)</Text>

          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Ionicons name="person" size={24} color={colors.primary} />
              <Text style={styles.locationName}>{delivery.customer.name}</Text>
            </View>

            <Text style={styles.locationAddress}>{delivery.customer.address}</Text>
            
            {delivery.customer.complement && (
              <Text style={styles.locationComplement}>{delivery.customer.complement}</Text>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleCallPhone(delivery.customer.phone, delivery.customer.name)}
              >
                <Ionicons name="call" size={18} color={colors.primary} />
                <Text style={styles.actionButtonText}>Ligar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleOpenMaps(delivery.customer.address)}
              >
                <Ionicons name="navigate" size={18} color={colors.primary} />
                <Text style={styles.actionButtonText}>Abrir Mapa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Itens da Entrega */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens da Entrega ({delivery.items.length})</Text>

          {delivery.items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.requiresPrescription && (
                    <View style={styles.prescriptionBadge}>
                      <Ionicons name="document-text" size={12} color={colors.warning} />
                      <Text style={styles.prescriptionText}>Requer Receita</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingTop: 15,
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
  mainCard: {
    backgroundColor: colors.backgroundLight,
    margin: 20,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  deliveryFee: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.success,
  },
  section: {
    backgroundColor: colors.backgroundLight,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'right',
    flexShrink: 0,
  },
  infoValueMono: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
    fontFamily: 'monospace',
    textAlign: 'right',
    flexShrink: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  locationCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  locationComplement: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.medboxLightGreen,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    width: 35,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  prescriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  prescriptionText: {
    fontSize: 10,
    color: colors.warning,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
});

export default DeliveryDetailsScreen;