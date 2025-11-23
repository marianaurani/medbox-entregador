// src/screens/delivery/DeliveryInProgressScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { useDelivery } from '../../contexts/DeliveryContext';
import colors from '../../constants/colors';
import { DeliveryStackParamList } from '../../types';

const DeliveryInProgressScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<DeliveryStackParamList>>();
  const route = useRoute();
  const { deliveryId } = route.params as { deliveryId: string };
  const { getDeliveryById, collectDelivery, completeDelivery } = useDelivery();

  const delivery = getDeliveryById(deliveryId);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'collect' | 'complete'>('collect');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!delivery) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textLight} />
          <Text style={styles.errorText}>Pedido não encontrado</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('DeliveryList')}
          >
            <Text style={styles.backButtonText}>Voltar para Pedidos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const handleCall = (phone: string, name: string) => {
    Alert.alert('Ligar', `Deseja ligar para ${name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Ligar',
        onPress: () => Linking.openURL(`tel:${phone}`),
      },
    ]);
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

  const handleNavigate = (lat: number, lon: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    Linking.openURL(url);
  };

  const openConfirmationModal = (type: 'collect' | 'complete') => {
    setModalType(type);
    setConfirmationCode('');
    setModalVisible(true);
  };

  const handleConfirmCode = async () => {
    if (confirmationCode.length < 4) {
      Alert.alert('Código inválido', 'O código deve ter pelo menos 4 dígitos');
      return;
    }

    setIsSubmitting(true);

    try {
      let success = false;

      if (modalType === 'collect') {
        success = await collectDelivery(deliveryId, confirmationCode);
      } else {
        success = await completeDelivery(deliveryId, confirmationCode);
      }

      if (success) {
        setModalVisible(false);
        setConfirmationCode('');

        if (modalType === 'complete') {
          Alert.alert('Entrega Concluída!', `Você ganhou ${formatCurrency(delivery.deliveryFee)}`, [
            {
              text: 'Ver Pedidos',
              onPress: () => navigation.navigate('DeliveryList'),
            },
          ]);
        } else {
          Alert.alert('Pedido Coletado!', 'Agora você pode iniciar a entrega ao cliente.');
        }
      } else {
        Alert.alert('Código incorreto', 'Verifique o código e tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível confirmar o código. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNextStepInfo = () => {
    if (delivery.status === 'aceito') {
      return {
        title: 'Colete o pedido na farmácia',
        description: 'Dirija-se à farmácia e solicite o código de confirmação',
        buttonText: 'Coletei o Pedido',
        buttonIcon: 'checkmark-circle' as const,
        action: () => openConfirmationModal('collect'),
      };
    } else if (delivery.status === 'em_rota') {
      return {
        title: 'Entregue ao cliente',
        description: 'Dirija-se ao endereço e solicite o código de confirmação',
        buttonText: 'Finalizar Entrega',
        buttonIcon: 'flag' as const,
        action: () => openConfirmationModal('complete'),
      };
    }
    return null;
  };

  const nextStep = getNextStepInfo();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entrega em Andamento</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIconContainer}>
              <Ionicons name="bicycle" size={32} color="white" />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>{nextStep?.title}</Text>
              <Text style={styles.statusDescription}>{nextStep?.description}</Text>
            </View>
          </View>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderIdLabel}>Pedido</Text>
            <Text style={styles.orderId}>{delivery.orderId}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Você vai ganhar</Text>
            <Text style={styles.feeValue}>{formatCurrency(delivery.deliveryFee)}</Text>
          </View>
        </View>

        {/* Origem - Farmácia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {delivery.status === 'aceito' ? '📍 Coletar em' : '✅ Coletado em'}
          </Text>
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
                onPress={() =>
                  handleNavigate(delivery.pharmacy.latitude, delivery.pharmacy.longitude)
                }
              >
                <Ionicons name="navigate" size={18} color="white" />
                <Text style={styles.navigateButtonText}>Navegar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Destino - Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {delivery.status === 'em_rota' ? '📍 Entregar em' : '🚚 Próxima parada'}
          </Text>
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
            {/* ✅ ATUALIZADO - Sempre mostra os botões (não só quando em_rota) */}
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
              {delivery.status === 'em_rota' && (
                <TouchableOpacity
                  style={styles.navigateButton}
                  onPress={() =>
                    handleNavigate(delivery.customer.latitude, delivery.customer.longitude)
                  }
                >
                  <Ionicons name="navigate" size={18} color="white" />
                  <Text style={styles.navigateButtonText}>Navegar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Itens do Pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens do Pedido ({delivery.items.length})</Text>
          <View style={styles.itemsCard}>
            {delivery.items.map((item, index) => (
              <View key={item.id}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.requiresPrescription && (
                      <View style={styles.prescriptionBadge}>
                        <Ionicons name="document-text" size={12} color={colors.warning} />
                        <Text style={styles.prescriptionText}>Requer Receita</Text>
                      </View>
                    )}
                  </View>
                </View>
                {index < delivery.items.length - 1 && <View style={styles.itemDivider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Botão de Ação - DENTRO DO SCROLL */}
        {nextStep && (
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={nextStep.action}>
              <Ionicons name={nextStep.buttonIcon} size={24} color="white" />
              <Text style={styles.actionButtonText}>{nextStep.buttonText}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Espaço extra no final para não ficar colado no menu */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal de Código de Confirmação */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Código de Confirmação</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              {modalType === 'collect'
                ? 'Solicite o código de confirmação com a farmácia'
                : 'Solicite o código de confirmação com o cliente'}
            </Text>

            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                value={confirmationCode}
                onChangeText={setConfirmationCode}
                placeholder="Digite o código"
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
              onPress={handleConfirmCode}
              disabled={isSubmitting}
            >
              <Text style={styles.confirmButtonText}>
                {isSubmitting ? 'Confirmando...' : 'Confirmar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  statusCard: {
    backgroundColor: colors.primary,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    marginBottom: 8,
  },
  orderIdLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  feeValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
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
    backgroundColor: colors.success,
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
  actionButtonContainer: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: colors.success,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  codeInputContainer: {
    marginBottom: 24,
  },
  codeInput: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 8,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DeliveryInProgressScreen;