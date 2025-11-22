// src/screens/home/HomeScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useDelivery } from '../../contexts/DeliveryContext';
import { mockEarnings } from '../../utils/mockData';
import colors from '../../constants/colors';

type MainTabParamList = {
  Home: undefined;
  Delivery: undefined;
  Wallet: undefined;
  Menu: undefined;
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();
  const { user, updateStatus } = useAuth();
  const { getAvailableDeliveries } = useDelivery();
  const [isAvailable, setIsAvailable] = useState(user?.status === 'disponivel');
  const [showEarningsInfo, setShowEarningsInfo] = useState(false);
  const [showHeatmapInfo, setShowHeatmapInfo] = useState(false);

  const earnings = mockEarnings;
  const availableDeliveries = getAvailableDeliveries();

  // Localização do entregador (simulada - Brasília centro)
  const delivererLocation = { latitude: -15.7942, longitude: -47.8822 };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const handleToggleStatus = async () => {
    const newStatus = isAvailable ? 'indisponivel' : 'disponivel';
    try {
      await updateStatus(newStatus);
      setIsAvailable(!isAvailable);
      Alert.alert(
        'Status Atualizado',
        `Você está ${newStatus === 'disponivel' ? 'disponível' : 'indisponível'} para entregas`
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleViewOrders = () => {
    navigation.navigate('Delivery');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoPlus}>+</Text>
          </View>
          <Text style={styles.logoText}>MedBox</Text>
        </View>

        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Mapa - Ocupa quase toda a tela */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: delivererLocation.latitude,
            longitude: delivererLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* ZONAS DE CALOR - Renderizadas primeiro (camada de baixo) */}
          
          {/* Círculo de área de cobertura do entregador - Base */}
          <Circle
            center={delivererLocation}
            radius={3000}
            strokeColor="rgba(0, 203, 169, 0.3)"
            fillColor="rgba(0, 203, 169, 0.08)"
            strokeWidth={2}
          />

          {/* Zonas Quentes - Alta Demanda (Vermelho) - Asa Norte */}
          <Circle
            center={{ latitude: -15.7641, longitude: -47.8826 }}
            radius={1500}
            strokeColor="rgba(244, 67, 54, 0.5)"
            fillColor="rgba(244, 67, 54, 0.2)"
            strokeWidth={2}
          />

          {/* Zonas Quentes - Demanda Média (Laranja) - Taguatinga */}
          <Circle
            center={{ latitude: -15.8367, longitude: -47.9318 }}
            radius={1200}
            strokeColor="rgba(255, 152, 0, 0.5)"
            fillColor="rgba(255, 152, 0, 0.15)"
            strokeWidth={2}
          />

          {/* Águas Claras - Demanda Média (Laranja) */}
          <Circle
            center={{ latitude: -15.8344, longitude: -48.0266 }}
            radius={1000}
            strokeColor="rgba(255, 152, 0, 0.5)"
            fillColor="rgba(255, 152, 0, 0.15)"
            strokeWidth={2}
          />

          {/* Zona de Baixa Demanda (Verde Claro) - Asa Sul */}
          <Circle
            center={{ latitude: -15.8175, longitude: -47.9136 }}
            radius={900}
            strokeColor="rgba(76, 175, 80, 0.4)"
            fillColor="rgba(76, 175, 80, 0.1)"
            strokeWidth={2}
          />

          {/* MARCADORES - Renderizados por último (sempre visíveis) */}
          
          {/* Marcadores das farmácias com pedidos disponíveis */}
          {availableDeliveries.map((delivery, index) => (
            <Marker
              key={delivery.id}
              coordinate={{
                latitude: delivery.pharmacy.latitude,
                longitude: delivery.pharmacy.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
            >
              <View style={styles.pharmacyMarker}>
                <Ionicons name="storefront" size={18} color="white" />
              </View>
            </Marker>
          ))}

          {/* Marcador da posição do entregador - Sempre no topo */}
          <Marker 
            coordinate={delivererLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.delivererMarker}>
              <Ionicons name="bicycle" size={22} color="white" />
            </View>
          </Marker>
        </MapView>

        {/* Mini Badge de Ganhos - Topo Esquerdo */}
        <TouchableOpacity
          style={styles.earningsBadge}
          onPress={() => setShowEarningsInfo(true)}
          activeOpacity={0.8}
        >
          <View style={styles.earningsBadgeContent}>
            <Text style={styles.earningsBadgeLabel}>Ganhos hoje</Text>
            <Text style={styles.earningsBadgeValue}>{formatCurrency(earnings.today)}</Text>
          </View>
          <View style={styles.earningsBadgeStat}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={styles.earningsBadgeStatText}>{earnings.deliveriesToday}</Text>
            <Text style={styles.earningsBadgeStatLabel}>entregas</Text>
          </View>
        </TouchableOpacity>

        {/* Badge de Pedidos Disponíveis - Topo Direito */}
        {availableDeliveries.length > 0 && (
          <TouchableOpacity
            style={styles.ordersBadge}
            onPress={handleViewOrders}
            activeOpacity={0.8}
          >
            <View style={styles.ordersIconContainer}>
              <Ionicons name="cube" size={18} color="white" />
              <View style={styles.ordersCounter}>
                <Text style={styles.ordersCounterText}>{availableDeliveries.length}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Botão de Informações do Mapa - Bottom Left */}
        <TouchableOpacity
          style={styles.heatmapInfoButton}
          onPress={() => setShowHeatmapInfo(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="information-circle" size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* Botão de Status - Bottom */}
        <View style={styles.statusContainer}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              isAvailable ? styles.statusButtonAvailable : styles.statusButtonUnavailable,
            ]}
            onPress={handleToggleStatus}
            activeOpacity={0.9}
          >
            <View style={styles.statusContent}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: isAvailable ? '#FFFFFF' : '#999999' },
                ]}
              />
              <View style={styles.statusTextContainer}>
                <Text
                  style={[
                    styles.statusText,
                    { color: isAvailable ? '#FFFFFF' : '#666666' },
                  ]}
                >
                  {isAvailable ? 'Você está disponível' : 'Você está indisponível'}
                </Text>
                <Text
                  style={[
                    styles.statusSubtext,
                    { color: isAvailable ? 'rgba(255,255,255,0.85)' : '#999999' },
                  ]}
                >
                  {isAvailable ? 'Toque para pausar' : 'Toque para começar a receber pedidos'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de Informações de Ganhos */}
      {showEarningsInfo && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEarningsInfo(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Resumo de Hoje</Text>
              <TouchableOpacity onPress={() => setShowEarningsInfo(false)}>
                <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalStats}>
              <View style={styles.modalStatItem}>
                <View style={styles.modalStatIcon}>
                  <Ionicons name="cash" size={24} color={colors.success} />
                </View>
                <View style={styles.modalStatInfo}>
                  <Text style={styles.modalStatLabel}>Ganhos de Hoje</Text>
                  <Text style={styles.modalStatValue}>{formatCurrency(earnings.today)}</Text>
                </View>
              </View>

              <View style={styles.modalDivider} />

              <View style={styles.modalStatItem}>
                <View style={styles.modalStatIcon}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                </View>
                <View style={styles.modalStatInfo}>
                  <Text style={styles.modalStatLabel}>Entregas Finalizadas</Text>
                  <Text style={styles.modalStatValue}>{earnings.deliveriesToday} entregas</Text>
                </View>
              </View>

              <View style={styles.modalDivider} />

              <View style={styles.modalStatItem}>
                <View style={styles.modalStatIcon}>
                  <Ionicons name="bicycle" size={24} color={colors.info} />
                </View>
                <View style={styles.modalStatInfo}>
                  <Text style={styles.modalStatLabel}>Rotas Aceitas</Text>
                  <Text style={styles.modalStatValue}>{earnings.routesAccepted} rotas</Text>
                </View>
              </View>

              <View style={styles.modalDivider} />

              <View style={styles.modalStatItem}>
                <View style={styles.modalStatIcon}>
                  <Ionicons name="trending-up" size={24} color={colors.warning} />
                </View>
                <View style={styles.modalStatInfo}>
                  <Text style={styles.modalStatLabel}>Taxa de Conclusão</Text>
                  <Text style={styles.modalStatValue}>
                    {Math.round((earnings.routesCompleted / earnings.routesAccepted) * 100)}%
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowEarningsInfo(false);
                navigation.navigate('Wallet');
              }}
            >
              <Text style={styles.modalButtonText}>Ver Detalhes na Carteira</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Modal de Informações do Mapa de Calor */}
      {showHeatmapInfo && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowHeatmapInfo(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Zonas de Demanda</Text>
              <TouchableOpacity onPress={() => setShowHeatmapInfo(false)}>
                <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.heatmapDescription}>
              As áreas coloridas no mapa mostram onde há maior demanda por entregas em tempo real.
            </Text>

            <View style={styles.modalStats}>
              <View style={styles.modalStatItem}>
                <View style={[styles.heatmapDotLarge, { backgroundColor: 'rgba(244, 67, 54, 0.8)' }]} />
                <View style={styles.modalStatInfo}>
                  <Text style={styles.modalStatLabel}>Alta Demanda</Text>
                  <Text style={styles.heatmapZoneDescription}>
                    Muitos pedidos disponíveis. Regiões mais lucrativas para trabalhar.
                  </Text>
                </View>
              </View>

              <View style={styles.modalDivider} />

              <View style={styles.modalStatItem}>
                <View style={[styles.heatmapDotLarge, { backgroundColor: 'rgba(255, 152, 0, 0.8)' }]} />
                <View style={styles.modalStatInfo}>
                  <Text style={styles.modalStatLabel}>Demanda Média</Text>
                  <Text style={styles.heatmapZoneDescription}>
                    Quantidade moderada de pedidos. Boas oportunidades.
                  </Text>
                </View>
              </View>

              <View style={styles.modalDivider} />

              <View style={styles.modalStatItem}>
                <View style={[styles.heatmapDotLarge, { backgroundColor: 'rgba(76, 175, 80, 0.8)' }]} />
                <View style={styles.modalStatInfo}>
                  <Text style={styles.modalStatLabel}>Baixa Demanda</Text>
                  <Text style={styles.heatmapZoneDescription}>
                    Poucos pedidos disponíveis no momento.
                  </Text>
                </View>
              </View>

              <View style={styles.modalDivider} />

              <View style={styles.modalStatItem}>
                <View style={[styles.heatmapDotLarge, { backgroundColor: 'rgba(0, 203, 169, 0.5)' }]} />
                <View style={styles.modalStatInfo}>
                  <Text style={styles.modalStatLabel}>Sua Área de Cobertura</Text>
                  <Text style={styles.heatmapZoneDescription}>
                    Raio de 3km onde você pode receber pedidos.
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowHeatmapInfo(false)}
            >
              <Text style={styles.modalButtonText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlus: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  delivererMarker: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pharmacyMarker: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 180,
  },
  earningsBadgeContent: {
    flex: 1,
  },
  earningsBadgeLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  earningsBadgeValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  earningsBadgeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.medboxLightGreen,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  earningsBadgeStatText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  earningsBadgeStatLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  ordersBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: colors.primary,
    borderRadius: 26,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  ordersIconContainer: {
    position: 'relative',
  },
  ordersCounter: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  ordersCounterText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  heatmapInfoButton: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 28,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    gap: 12,
  },
  statusButton: {
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  statusButtonAvailable: {
    backgroundColor: colors.success,
  },
  statusButtonUnavailable: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: colors.border,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statusSubtext: {
    fontSize: 11,
  },
  viewOrdersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewOrdersText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalStats: {
    gap: 16,
  },
  modalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.medboxLightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalStatInfo: {
    flex: 1,
  },
  modalStatLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  modalButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  heatmapDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  heatmapDotLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  heatmapZoneDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default HomeScreen;