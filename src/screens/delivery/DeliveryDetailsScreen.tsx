// src/screens/delivery/DeliveryDetailsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { mockDeliveries } from '../../utils/mockData';
import colors from '../../constants/colors';
import { DeliveryStackParamList } from '../../types';

const DeliveryDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<DeliveryStackParamList>>();
  const route = useRoute();
  const { deliveryId } = route.params as { deliveryId: string };

  const delivery = mockDeliveries.find(d => d.id === deliveryId);

  if (!delivery) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Pedido não encontrado</Text>
      </SafeAreaView>
    );
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const formatDistance = (distance: number) => {
    return `${distance.toFixed(1)} km`;
  };

  const handleCall = (phone: string, name: string) => {
    Alert.alert(
      'Ligar',
      `Deseja ligar para ${name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ligar',
          onPress: () => Linking.openURL(`tel:${phone}`),
        },
      ]
    );
  };

  // ✅ NOVO - Função para abrir chat com o cliente
  const handleChatCustomer = () => {
    navigation.navigate('Chat', {
      chatType: 'customer',
      chatName: delivery.customer.name,
      deliveryId: delivery.id,
    });
  };

  // ✅ NOVO - Função para abrir chat com a farmácia
  const handleChatPharmacy = () => {
    navigation.navigate('Chat', {
      chatType: 'pharmacy',
      chatName: delivery.pharmacy.name,
      deliveryId: delivery.id,
    });
  };

  const handleAcceptDelivery = () => {
    Alert.alert(
      'Aceitar Pedido',
      'Deseja aceitar este pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar',
          onPress: () => {
            navigation.navigate('DeliveryInProgress', { deliveryId });
          },
        },
      ]
    );
  };

  const handleNavigateToPharmacy = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${delivery.pharmacy.latitude},${delivery.pharmacy.longitude}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Pedido</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Card de Informações Principais */}
        <View style={styles.mainCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>{delivery.orderId}</Text>
            <Text style={styles.deliveryFee}>{formatCurrency(delivery.deliveryFee)}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="navigate-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{formatDistance(delivery.distance)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{delivery.estimatedTime} min</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="cube-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{delivery.items.length} itens</Text>
            </View>
          </View>
        </View>

        {/* Origem - Farmácia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Origem - Farmácia</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <View style={styles.locationIcon}>
                <Ionicons name="storefront" size={24} color={colors.primary} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{delivery.pharmacy.name}</Text>
                <Text style={styles.locationAddress}>{delivery.pharmacy.address}</Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCall(delivery.pharmacy.phone, delivery.pharmacy.name)}
              >
                <Ionicons name="call" size={18} color="white" />
                <Text style={styles.callButtonText}>Ligar</Text>
              </TouchableOpacity>
              {/* ✅ NOVO - Botão de Chat com Farmácia */}
              <TouchableOpacity
                style={styles.chatButton}
                onPress={handleChatPharmacy}
              >
                <Ionicons name="chatbubble" size={18} color="white" />
                <Text style={styles.chatButtonText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navigateButton}
                onPress={handleNavigateToPharmacy}
              >
                <Ionicons name="navigate" size={18} color="white" />
                <Text style={styles.navigateButtonText}>Navegar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Destino - Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destino - Cliente</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <View style={[styles.locationIcon, { backgroundColor: colors.medboxLightGreen }]}>
                <Ionicons name="person" size={24} color={colors.primary} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{delivery.customer.name}</Text>
                <Text style={styles.locationAddress}>{delivery.customer.address}</Text>
                {delivery.customer.complement && (
                  <Text style={styles.locationComplement}>{delivery.customer.complement}</Text>
                )}
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCall(delivery.customer.phone, delivery.customer.name)}
              >
                <Ionicons name="call" size={18} color="white" />
                <Text style={styles.callButtonText}>Ligar</Text>
              </TouchableOpacity>
              {/* ✅ NOVO - Botão de Chat com Cliente */}
              <TouchableOpacity
                style={styles.chatButton}
                onPress={handleChatCustomer}
              >
                <Ionicons name="chatbubble" size={18} color="white" />
                <Text style={styles.chatButtonText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Itens do Pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens do Pedido</Text>
          <View style={styles.itemsCard}>
            {delivery.items.map((item, index) => (
              <View key={item.id}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.requiresPrescription && (
                        <View style={styles.prescriptionBadge}>
                          <Ionicons name="document-text" size={12} color={colors.warning} />
                          <Text style={styles.prescriptionText}>Receita</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {index < delivery.items.length - 1 && <View style={styles.itemDivider} />}
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botão Fixo de Aceitar */}
      {delivery.status === 'disponivel' && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptDelivery}>
            <Text style={styles.acceptButtonText}>Aceitar Pedido</Text>
            <Ionicons name="checkmark-circle" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
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
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  deliveryFee: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.success,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  locationCard: {
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  locationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.medboxLightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  locationComplement: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  callButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // ✅ NOVO - Estilos do botão de Chat
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.info,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  navigateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.info,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  navigateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  itemsCard: {
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  itemInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    minWidth: 30,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  prescriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.warning}15`,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  prescriptionText: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: '600',
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundLight,
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  acceptButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DeliveryDetailsScreen;