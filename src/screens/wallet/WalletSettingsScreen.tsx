// src/screens/wallet/WalletSettingsScreen.tsx
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
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useWallet } from '../../contexts/WalletContext';
import { useBank } from '../../contexts/BankContext';
import colors from '../../constants/colors';

const WalletSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isBalanceVisible, toggleBalanceVisibility } = useWallet();
  const { pixKeys, defaultPixKey, bankAccount } = useBank();

  const navigateToBankData = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Menu',
        params: {
          screen: 'Profile',
          params: { screen: 'BankData' },
        },
      })
    );
  };

  const navigateToBankAccount = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Menu',
        params: {
          screen: 'Profile',
          params: { screen: 'BankAccount' },
        },
      })
    );
  };

  const navigateToAddPixKey = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Menu',
        params: {
          screen: 'Profile',
          params: { screen: 'AddPixKey' },
        },
      })
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações da Carteira</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
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
                  Esconda os valores da carteira
                </Text>
              </View>
            </View>
            <Switch
              value={!isBalanceVisible}
              onValueChange={toggleBalanceVisibility}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="white"
            />
          </View>
        </View>

        {/* Seção Dados Bancários */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados para Saque</Text>

          {/* Chaves PIX */}
          <TouchableOpacity 
            style={styles.settingCard}
            onPress={navigateToBankData}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="key" size={24} color={colors.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Chaves PIX</Text>
                <Text style={styles.settingDescription}>
                  {pixKeys.length} {pixKeys.length === 1 ? 'chave cadastrada' : 'chaves cadastradas'}
                </Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              {defaultPixKey && (
                <View style={styles.badge}>
                  <Ionicons name="star" size={12} color={colors.warning} />
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </View>
          </TouchableOpacity>

          {/* Conta Bancária */}
          <TouchableOpacity 
            style={styles.settingCard}
            onPress={navigateToBankAccount}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="business" size={24} color={colors.success} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Conta Bancária</Text>
                <Text style={styles.settingDescription}>
                  {bankAccount ? `${bankAccount.bank}` : 'Não cadastrada'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Seção Ações Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={navigateToAddPixKey}
          >
            <Ionicons name="add-circle" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Adicionar Nova Chave PIX</Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Sobre Saques</Text>
            <Text style={styles.infoText}>
              Configure suas chaves PIX e conta bancária para realizar saques de forma rápida e segura. 
              Saques via PIX são instantâneos e gratuitos.
            </Text>
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Resumo de Configurações</Text>
          
          <View style={styles.statsList}>
            <View style={styles.statItem}>
              <Ionicons name="key" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Chaves PIX</Text>
              <Text style={styles.statValue}>{pixKeys.length}</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Ionicons name="business" size={20} color={colors.success} />
              <Text style={styles.statLabel}>Conta Bancária</Text>
              <View style={[
                styles.statBadge, 
                { backgroundColor: bankAccount ? colors.success + '20' : colors.error + '20' }
              ]}>
                <Text style={[
                  styles.statBadgeText,
                  { color: bankAccount ? colors.success : colors.error }
                ]}>
                  {bankAccount ? 'Cadastrada' : 'Não cadastrada'}
                </Text>
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
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    gap: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.medboxLightGreen,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
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
    padding: 16,
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
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  statDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  statBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default WalletSettingsScreen;