// src/screens/auth/VehicleSelectionScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList, VehicleType } from '../../types';
import colors from '../../constants/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'VehicleSelection'>;

interface VehicleOption {
  type: VehicleType;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  requiresCNH: boolean;
  cnhCategory?: string;
  documentRequired: string;
  advantages: string[];
}

const vehicleOptions: VehicleOption[] = [
  {
    type: 'moto',
    icon: 'bicycle',
    label: 'Moto',
    requiresCNH: true,
    cnhCategory: 'A',
    documentRequired: 'CNH Categoria A',
    advantages: [
      'Entregas mais rápidas',
      'Maior número de rotas',
      'Melhor ganho por hora',
    ],
  },
  {
    type: 'carro',
    icon: 'car-sport',
    label: 'Carro',
    requiresCNH: true,
    cnhCategory: 'B',
    documentRequired: 'CNH Categoria B',
    advantages: [
      'Proteção contra chuva',
      'Entregas maiores',
      'Mais conforto',
    ],
  },
  {
    type: 'bike',
    icon: 'bicycle',
    label: 'Bicicleta',
    requiresCNH: false,
    documentRequired: 'RG ou CPF com foto',
    advantages: [
      'Sem custos com combustível',
      'Não precisa de CNH',
      'Ideal para distâncias curtas',
    ],
  },
];

const VehicleSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedVehicle) return;

    try {
      setLoading(true);
      // Aqui você pode salvar no contexto ou AsyncStorage
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navega para PhotoUpload
      navigation.navigate('PhotoUpload', { vehicleType: selectedVehicle });
    } catch (error) {
      console.error('Erro ao continuar:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedOption = () => {
    return vehicleOptions.find(v => v.type === selectedVehicle);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundLight} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escolha seu veículo</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Conteúdo com Scroll */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Qual veículo você vai usar?</Text>
          <Text style={styles.subtitle}>
            Escolha o veículo que você utilizará para fazer as entregas. Você poderá alterá-lo
            depois se necessário.
          </Text>
        </View>

        {/* Cards de Veículos */}
        <View style={styles.vehiclesContainer}>
          {vehicleOptions.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.type}
              style={[
                styles.vehicleCard,
                selectedVehicle === vehicle.type && styles.vehicleCardSelected,
              ]}
              onPress={() => setSelectedVehicle(vehicle.type)}
              disabled={loading}
              activeOpacity={0.7}
            >
              {/* Check icon */}
              {selectedVehicle === vehicle.type && (
                <View style={styles.checkContainer}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                </View>
              )}

              {/* Ícone do veículo */}
              <View
                style={[
                  styles.vehicleIconContainer,
                  selectedVehicle === vehicle.type && styles.vehicleIconContainerSelected,
                ]}
              >
                <Ionicons
                  name={vehicle.icon}
                  size={40}
                  color={selectedVehicle === vehicle.type ? colors.primary : colors.textSecondary}
                />
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.vehicleLabel,
                  selectedVehicle === vehicle.type && styles.vehicleLabelSelected,
                ]}
              >
                {vehicle.label}
              </Text>

              {/* Documento necessário */}
              <View style={styles.documentBadge}>
                <Ionicons
                  name={vehicle.requiresCNH ? 'card' : 'document-text'}
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.documentText}>{vehicle.documentRequired}</Text>
              </View>

              {/* Vantagens */}
              <View style={styles.advantagesContainer}>
                {vehicle.advantages.map((advantage, index) => (
                  <View key={index} style={styles.advantageItem}>
                    <Ionicons name="checkmark" size={14} color={colors.success} />
                    <Text style={styles.advantageText}>{advantage}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info importante */}
        {selectedVehicle && getSelectedOption()?.requiresCNH && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Documento obrigatório</Text>
              <Text style={styles.infoText}>
                Na próxima etapa, você precisará enviar uma foto da sua{' '}
                <Text style={styles.infoBold}>
                  CNH categoria {getSelectedOption()?.cnhCategory}
                </Text>{' '}
                válida e dentro do prazo de validade.
              </Text>
            </View>
          </View>
        )}

        {selectedVehicle && !getSelectedOption()?.requiresCNH && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={colors.success} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Documento alternativo</Text>
              <Text style={styles.infoText}>
                Como você escolheu bicicleta, não é necessário CNH. Você precisará apenas de um{' '}
                <Text style={styles.infoBold}>RG ou CPF com foto</Text>.
              </Text>
            </View>
          </View>
        )}

        {/* Espaço extra */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Botão Fixo */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, (!selectedVehicle || loading) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selectedVehicle || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <>
              <Text style={styles.buttonText}>Continuar</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.text} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.backgroundLight,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  vehiclesContainer: {
    gap: 16,
    marginBottom: 20,
  },
  vehicleCard: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
  vehicleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  checkContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  vehicleIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.border + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  vehicleIconContainerSelected: {
    backgroundColor: colors.primary + '15',
  },
  vehicleLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  vehicleLabelSelected: {
    color: colors.primary,
  },
  documentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  documentText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  advantagesContainer: {
    gap: 8,
  },
  advantageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  advantageText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  infoBold: {
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 35,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    backgroundColor: colors.buttonSecondary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});

export default VehicleSelectionScreen;