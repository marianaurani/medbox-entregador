// src/screens/wallet/WalletSettingsScreen.tsx (CORRIGIDO)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../../contexts/WalletContext';
import { useBank } from '../../contexts/BankContext';
import colors from '../../constants/colors';

const WalletSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isBalanceVisible, toggleBalanceVisibility } = useWallet();
  const { pixKeys, defaultPixKey, hasBankAccount } = useBank();

  // ✅ Navegação cross-stack corrigida
  const navigateToBankData = () => {
    navigation.navigate('Menu', {
      screen: 'BankData'
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações da Carteira</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Info */}
        <View style={styles.heroCard}>
          <Ionicons name="settings" size={48} color={colors.primary} />
          <Text style={styles.heroTitle}>Personalize sua experiência</Text>
          <Text style={styles.heroSubtitle}>
            Configure suas preferências e gerencie como você interage com sua carteira
          </Text>
        </View>

        {/* Seção Privacidade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidade</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.info + '20' }]}>
                <Ionicons 
                  name={isBalanceVisible ? "eye" : "eye-off"} 
                  size={24} 
                  color={colors.info} 
                />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Ocultar Saldo</Text>
                <Text style={styles.settingDescription}>
                  Esconda os valores da sua carteira na tela inicial
                </Text>
              </View>
            </View>
            <Switch
              value={!isBalanceVisible}
              onValueChange={toggleBalanceVisibility}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="white"
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        {/* Seção Dados Bancários - Link Rápido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados para Recebimento</Text>

          <TouchableOpacity 
            style={styles.bankDataCard}
            onPress={navigateToBankData}
            activeOpacity={0.7}
          >
            <View style={styles.bankDataHeader}>
              <View style={[styles.bankDataIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="wallet" size={28} color={colors.primary} />
              </View>
              <View style={styles.bankDataInfo}>
                <Text style={styles.bankDataTitle}>Dados Bancários</Text>
                <Text style={styles.bankDataSubtitle}>
                  {pixKeys.length > 0 
                    ? `${pixKeys.length} ${pixKeys.length === 1 ? 'chave PIX cadastrada' : 'chaves PIX cadastradas'}`
                    : 'Nenhuma chave cadastrada'
                  }
                </Text>
                {defaultPixKey && (
                  <View style={styles.defaultKeyContainer}>
                    <Ionicons name="star" size={12} color={colors.warning} />
                    <Text style={styles.defaultKeyText} numberOfLines={1}>
                      Padrão: {defaultPixKey.key}
                    </Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
            </View>

            <View style={styles.bankDataFeatures}>
              <View style={styles.featureItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={16} 
                  color={pixKeys.length > 0 ? colors.success : colors.textLight} 
                />
                <Text style={[
                  styles.featureText,
                  pixKeys.length > 0 && { color: colors.success }
                ]}>
                  {pixKeys.length > 0 ? 'Chaves PIX configuradas' : 'Sem chaves PIX'}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={16} 
                  color={hasBankAccount ? colors.success : colors.textLight} 
                />
                <Text style={[
                  styles.featureText,
                  hasBankAccount && { color: colors.success }
                ]}>
                  {hasBankAccount ? 'Conta bancária cadastrada' : 'Sem conta bancária'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Seção Notificações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>
          
          <View style={styles.settingsList}>
            <View style={styles.settingCard}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="notifications" size={24} color={colors.success} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Transações</Text>
                  <Text style={styles.settingDescription}>
                    Receba notificações de entradas e saídas
                  </Text>
                </View>
              </View>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="white"
                ios_backgroundColor={colors.border}
              />
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.warning + '20' }]}>
                  <Ionicons name="cash" size={24} color={colors.warning} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Saques Processados</Text>
                  <Text style={styles.settingDescription}>
                    Confirmação quando saques forem concluídos
                  </Text>
                </View>
              </View>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="white"
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>💡 Dica Importante</Text>
            <Text style={styles.infoText}>
              Configure suas chaves PIX e conta bancária na seção "Dados Bancários" 
              para receber saques de forma rápida e gratuita. A chave marcada como 
              padrão será usada automaticamente nos saques via PIX.
            </Text>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Sobre Saques via PIX</Text>
          
          <View style={styles.statsList}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="flash" size={20} color={colors.success} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>Instantâneo</Text>
                <Text style={styles.statLabel}>Cai na hora</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="cash" size={20} color={colors.primary} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>R$ 0,00</Text>
                <Text style={styles.statLabel}>Sem taxas</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.info + '20' }]}>
                <Ionicons name="calendar" size={20} color={colors.info} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>24/7</Text>
                <Text style={styles.statLabel}>Sempre disponível</Text>
              </View>
            </View>
          </View>
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
    paddingVertical: 15,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  settingsList: {
    gap: 12,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  bankDataCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bankDataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  bankDataIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankDataInfo: {
    flex: 1,
  },
  bankDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  bankDataSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  defaultKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  defaultKeyText: {
    fontSize: 12,
    color: colors.textLight,
    flex: 1,
  },
  bankDataFeatures: {
    flexDirection: 'column',
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.medboxLightGreen,
    marginHorizontal: 20,
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  statsCard: {
    backgroundColor: colors.backgroundLight,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsList: {
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
});

export default WalletSettingsScreen;