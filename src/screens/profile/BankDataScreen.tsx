// src/screens/profile/BankDataScreen.tsx
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
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useBank, PixKeyType } from '../../contexts/BankContext';
import colors from '../../constants/colors';

type ProfileStackParamList = {
  ProfileHome: undefined;
  BankData: undefined;
  BankAccount: undefined;
  AddPixKey: { pixKeyId?: string } | undefined;
};

const BankDataScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const { pixKeys, defaultPixKey, deletePixKey, setDefaultPixKey, bankAccount, hasBankAccount } = useBank();

  const getPixIcon = (type: PixKeyType) => {
    switch (type) {
      case 'cpf':
        return 'person';
      case 'phone':
        return 'call';
      case 'email':
        return 'mail';
      case 'random':
        return 'key';
      default:
        return 'cash';
    }
  };

  const getPixLabel = (type: PixKeyType) => {
    switch (type) {
      case 'cpf':
        return 'CPF';
      case 'phone':
        return 'Telefone';
      case 'email':
        return 'E-mail';
      case 'random':
        return 'Chave Aleatória';
      default:
        return 'Outro';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDeletePixKey = (id: string, key: string) => {
    Alert.alert(
      'Excluir Chave PIX',
      `Deseja realmente excluir a chave ${key}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            const success = deletePixKey(id);
            if (success) {
              Alert.alert('Sucesso!', 'Chave PIX excluída com sucesso.');
            } else {
              Alert.alert('Atenção', 'Você precisa ter pelo menos uma chave PIX cadastrada.');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    setDefaultPixKey(id);
    Alert.alert('Chave Padrão Definida', 'Esta chave será usada automaticamente nos saques.');
  };

  const handleEditKey = (id: string) => {
    navigation.navigate('AddPixKey', { pixKeyId: id });
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
        <Text style={styles.headerTitle}>Dados Bancários</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddPixKey', {})}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="add-circle" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Sobre Chaves PIX</Text>
            <Text style={styles.infoText}>
              Suas chaves PIX são usadas para receber saques de forma rápida e gratuita. 
              A chave marcada como padrão será usada automaticamente.
            </Text>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="key" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>{pixKeys.length}</Text>
              <Text style={styles.statLabel}>Chaves Cadastradas</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="flash" size={20} color={colors.success} />
            </View>
            <View>
              <Text style={styles.statValue}>Grátis</Text>
              <Text style={styles.statLabel}>Saques via PIX</Text>
            </View>
          </View>
        </View>

        {/* Chave Padrão */}
        {defaultPixKey && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chave Padrão</Text>
            <View style={styles.defaultCard}>
              <View style={styles.defaultHeader}>
                <View style={[styles.pixIconLarge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  <Ionicons 
                    name={getPixIcon(defaultPixKey.type)} 
                    size={28} 
                    color="white" 
                  />
                </View>
                <View style={styles.defaultInfo}>
                  <View style={styles.defaultBadgeRow}>
                    <Text style={styles.defaultLabel}>{getPixLabel(defaultPixKey.type)}</Text>
                    <View style={styles.defaultBadge}>
                      <Ionicons name="star" size={12} color="#FFA500" />
                      <Text style={styles.defaultBadgeText}>Padrão</Text>
                    </View>
                  </View>
                  <Text style={styles.defaultKey} numberOfLines={1}>{defaultPixKey.key}</Text>
                  <Text style={styles.defaultDate}>Cadastrada em {formatDate(defaultPixKey.createdAt)}</Text>
                </View>
              </View>
              
              <View style={styles.defaultActions}>
                <TouchableOpacity 
                  style={styles.defaultActionButton}
                  onPress={() => handleEditKey(defaultPixKey.id)}
                >
                  <Ionicons name="create-outline" size={18} color="white" />
                  <Text style={styles.defaultActionText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.defaultActionButton, styles.defaultActionButtonDelete]}
                  onPress={() => handleDeletePixKey(defaultPixKey.id, defaultPixKey.key)}
                >
                  <Ionicons name="trash-outline" size={18} color="white" />
                  <Text style={styles.defaultActionText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Outras Chaves */}
        {pixKeys.filter(pk => !pk.isDefault).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Outras Chaves</Text>
            <View style={styles.keysContainer}>
              {pixKeys
                .filter(pk => !pk.isDefault)
                .map((pixKey) => (
                  <View key={pixKey.id} style={styles.pixKeyCard}>
                    <View style={styles.pixKeyHeader}>
                      <View style={[styles.pixIconMedium, { backgroundColor: colors.medboxLightGreen }]}>
                        <Ionicons 
                          name={getPixIcon(pixKey.type)} 
                          size={24} 
                          color={colors.primary} 
                        />
                      </View>
                      <View style={styles.pixKeyInfo}>
                        <Text style={styles.pixKeyLabel}>{getPixLabel(pixKey.type)}</Text>
                        <Text style={styles.pixKeyValue} numberOfLines={1}>{pixKey.key}</Text>
                        <Text style={styles.pixKeyDate}>Cadastrada em {formatDate(pixKey.createdAt)}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.pixKeyActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleSetDefault(pixKey.id)}
                      >
                        <Ionicons name="star-outline" size={20} color={colors.warning} />
                        <Text style={styles.actionButtonText}>Tornar Padrão</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleEditKey(pixKey.id)}
                      >
                        <Ionicons name="create-outline" size={20} color={colors.primary} />
                        <Text style={styles.actionButtonText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.actionButtonDelete]}
                        onPress={() => handleDeletePixKey(pixKey.id, pixKey.key)}
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                        <Text style={[styles.actionButtonText, { color: colors.error }]}>Excluir</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Botão Adicionar */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPixKey', {})}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.addButtonText}>Adicionar Nova Chave PIX</Text>
        </TouchableOpacity>

        {/* Conta Bancária */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta Bancária</Text>
          {hasBankAccount && bankAccount ? (
            <View style={styles.bankCard}>
              <View style={styles.bankHeader}>
                <Ionicons name="business" size={24} color={colors.primary} />
                <View style={styles.bankInfo}>
                  <Text style={styles.bankName}>{bankAccount.bank}</Text>
                  <Text style={styles.bankDetails}>
                    Ag: {bankAccount.agency} • Conta: {bankAccount.account}-{bankAccount.digit}
                  </Text>
                  <Text style={styles.bankType}>
                    {bankAccount.accountType === 'corrente' ? 'Conta Corrente' : 'Conta Poupança'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.editBankButton}
                onPress={() => navigation.navigate('BankAccount')}
              >
                <Ionicons name="create-outline" size={18} color={colors.primary} />
                <Text style={styles.editBankText}>Editar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addBankButton}
              onPress={() => navigation.navigate('BankAccount')}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
              <Text style={styles.addBankText}>Adicionar Conta Bancária</Text>
              <Text style={styles.addBankSubtext}>
                Necessário para saques via TED e Transferência
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dicas */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Dicas Importantes</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.tipText}>Você pode ter várias chaves PIX cadastradas</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.tipText}>A chave padrão é usada automaticamente nos saques</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.tipText}>Saques via PIX são gratuitos e instantâneos</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.tipText}>Mantenha suas chaves sempre atualizadas</Text>
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
  content: {
    padding: 20,
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
    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
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
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  defaultCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  defaultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  pixIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultInfo: {
    flex: 1,
  },
  defaultBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  defaultLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFA500',
  },
  defaultKey: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  defaultDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  defaultActions: {
    flexDirection: 'row',
    gap: 10,
  },
  defaultActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  defaultActionButtonDelete: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  defaultActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  keysContainer: {
    gap: 12,
  },
  pixKeyCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pixKeyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  pixIconMedium: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pixKeyInfo: {
    flex: 1,
  },
  pixKeyLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  pixKeyValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  pixKeyDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  pixKeyActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonDelete: {
    borderColor: colors.error + '30',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
    padding: 18,
    borderRadius: 12,
    gap: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  bankCard: {
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bankHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  bankDetails: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  bankType: {
    fontSize: 12,
    color: colors.textLight,
  },
  editBankButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.medboxLightGreen,
    gap: 4,
  },
  editBankText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  addBankButton: {
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    gap: 8,
  },
  addBankText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  addBankSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tipsCard: {
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  tipsList: {
    gap: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default BankDataScreen;