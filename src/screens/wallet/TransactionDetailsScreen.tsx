// src/screens/wallet/TransactionDetailsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useWallet } from '../../contexts/WalletContext';
import { useDelivery } from '../../contexts/DeliveryContext';
import { WalletStackParamList } from '../../types';
import colors from '../../constants/colors';

type RouteParams = RouteProp<WalletStackParamList, 'TransactionDetails'>;

const TransactionDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const { transactionId } = route.params;

  const { getTransactionById, isBalanceVisible } = useWallet();
  const { getDeliveryById } = useDelivery();

  const transaction = getTransactionById(transactionId);
  const delivery = transaction?.deliveryId ? getDeliveryById(transaction.deliveryId) : undefined;

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transação</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Transação não encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatCurrency = (value: number) => {
    if (!isBalanceVisible) {
      return 'R$ ••••••';
    }
    return `R$ ${Math.abs(value).toFixed(2).replace('.', ',')}`;
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

  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'entrega':
        return 'bicycle';
      case 'saque':
        return 'arrow-up-circle';
      case 'bonus':
        return 'gift';
      default:
        return 'cash';
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'concluido':
        return colors.success;
      case 'pendente':
        return colors.warning;
      case 'cancelado':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (transaction.status) {
      case 'concluido':
        return 'Concluído';
      case 'pendente':
        return 'Pendente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return transaction.status;
    }
  };

  const getTypeLabel = () => {
    switch (transaction.type) {
      case 'entrega':
        return 'Entrega';
      case 'saque':
        return 'Saque';
      case 'bonus':
        return 'Bônus';
      case 'estorno':
        return 'Estorno';
      case 'ajuste':
        return 'Ajuste';
      default:
        return transaction.type;
    }
  };

  const handleCallCustomer = () => {
    if (delivery?.customer.phone) {
      Alert.alert('Ligar', `Ligar para ${delivery.customer.phone}?`);
    }
  };

  const handleCallPharmacy = () => {
    if (delivery?.pharmacy.phone) {
      Alert.alert('Ligar', `Ligar para ${delivery.pharmacy.phone}?`);
    }
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
        <Text style={styles.headerTitle}>Detalhes da Transação</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: transaction.amount > 0 ? colors.medboxLightGreen : colors.backgroundCard }
          ]}>
            <Ionicons
              name={getTransactionIcon()}
              size={32}
              color={transaction.amount > 0 ? colors.primary : colors.textSecondary}
            />
          </View>

          <Text style={[
            styles.amount,
            { color: transaction.amount > 0 ? colors.success : colors.error }
          ]}>
            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
          </Text>

          <Text style={styles.description}>{transaction.description}</Text>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusLabel()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo</Text>
            <Text style={styles.infoValue}>{getTypeLabel()}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data e Hora</Text>
            <Text style={styles.infoValue}>{formatDate(transaction.date)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID da Transação</Text>
            <Text style={styles.infoValueMono}>{transaction.id}</Text>
          </View>

          {transaction.deliveryId && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID da Entrega</Text>
                <Text style={styles.infoValueMono}>{transaction.deliveryId}</Text>
              </View>
            </>
          )}
        </View>

        {delivery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalhes da Entrega</Text>

            <View style={styles.deliveryCard}>
              <View style={styles.deliveryHeader}>
                <Ionicons name="person" size={20} color={colors.primary} />
                <Text style={styles.deliveryTitle}>Cliente</Text>
              </View>
              <Text style={styles.deliveryName}>{delivery.customer.name}</Text>
              <Text style={styles.deliveryAddress}>{delivery.customer.address}</Text>
              {delivery.customer.complement && (
                <Text style={styles.deliveryComplement}>{delivery.customer.complement}</Text>
              )}
              <TouchableOpacity style={styles.callButton} onPress={handleCallCustomer}>
                <Ionicons name="call" size={16} color={colors.primary} />
                <Text style={styles.callButtonText}>{delivery.customer.phone}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.deliveryCard}>
              <View style={styles.deliveryHeader}>
                <Ionicons name="medical" size={20} color={colors.primary} />
                <Text style={styles.deliveryTitle}>Farmácia</Text>
              </View>
              <Text style={styles.deliveryName}>{delivery.pharmacy.name}</Text>
              <Text style={styles.deliveryAddress}>{delivery.pharmacy.address}</Text>
              <TouchableOpacity style={styles.callButton} onPress={handleCallPharmacy}>
                <Ionicons name="call" size={16} color={colors.primary} />
                <Text style={styles.callButtonText}>{delivery.pharmacy.phone}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="navigate" size={20} color={colors.textSecondary} />
                <Text style={styles.statLabel}>Distância</Text>
                <Text style={styles.statValue}>{delivery.distance.toFixed(1)} km</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={20} color={colors.textSecondary} />
                <Text style={styles.statLabel}>Tempo</Text>
                <Text style={styles.statValue}>{delivery.estimatedTime} min</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="cube" size={20} color={colors.textSecondary} />
                <Text style={styles.statLabel}>Itens</Text>
                <Text style={styles.statValue}>{delivery.items.length}</Text>
              </View>
            </View>

            <View style={styles.itemsContainer}>
              <Text style={styles.itemsTitle}>Itens da Entrega</Text>
              {delivery.items.map((item) => (
                <View key={item.id} style={styles.item}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                    <View>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.requiresPrescription && (
                        <View style={styles.prescriptionBadge}>
                          <Ionicons name="document-text" size={10} color={colors.warning} />
                          <Text style={styles.prescriptionText}>Receita</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

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
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
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
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  infoValueMono: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
    fontFamily: 'monospace',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  deliveryCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  deliveryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  deliveryAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  deliveryComplement: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 8,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  callButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  itemsContainer: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    width: 30,
  },
  itemName: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  prescriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  prescriptionText: {
    fontSize: 10,
    color: colors.warning,
    fontWeight: '600',
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

export default TransactionDetailsScreen;