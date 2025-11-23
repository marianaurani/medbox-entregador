// src/screens/profile/BankDataScreen.tsx (REDESIGN MODERNO)
import React, { useState } from 'react';
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
  const [expandedKeyId, setExpandedKeyId] = useState<string | null>(null);

  const getPixIcon = (type: PixKeyType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'cpf': return 'person';
      case 'phone': return 'call';
      case 'email': return 'mail';
      case 'random': return 'key';
      default: return 'cash';
    }
  };

  const getPixLabel = (type: PixKeyType) => {
    switch (type) {
      case 'cpf': return 'CPF';
      case 'phone': return 'Telefone';
      case 'email': return 'E-mail';
      case 'random': return 'Chave Aleatória';
      default: return 'Outro';
    }
  };

  const handleDeletePixKey = (id: string, key: string) => {
    Alert.alert(
      'Excluir Chave PIX',
      `Tem certeza que deseja excluir a chave:\n\n${key}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            const success = deletePixKey(id);
            if (success) {
              Alert.alert('✓ Chave removida', 'Chave PIX excluída com sucesso.');
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
    Alert.alert('✓ Chave padrão definida', 'Esta chave será usada automaticamente nos saques.');
  };

  const toggleExpanded = (id: string) => {
    setExpandedKeyId(expandedKeyId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dados Bancários</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddPixKey', {})}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="wallet" size={32} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Receba seus pagamentos</Text>
          <Text style={styles.heroSubtitle}>
            Configure suas chaves PIX e conta bancária para saques rápidos e gratuitos
          </Text>
          
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{pixKeys.length}</Text>
              <Text style={styles.heroStatLabel}>Chaves PIX</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Ionicons name="flash" size={20} color={colors.success} />
              <Text style={styles.heroStatLabel}>Grátis</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Ionicons name="time" size={20} color={colors.info} />
              <Text style={styles.heroStatLabel}>Instantâneo</Text>
            </View>
          </View>
        </View>

        {/* Chaves PIX */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chaves PIX</Text>
            {defaultPixKey && (
              <View style={styles.defaultBadge}>
                <Ionicons name="star" size={12} color={colors.warning} />
                <Text style={styles.defaultBadgeText}>1 padrão</Text>
              </View>
            )}
          </View>

          {pixKeys.length === 0 ? (
            <TouchableOpacity 
              style={styles.emptyCard}
              onPress={() => navigation.navigate('AddPixKey', {})}
            >
              <Ionicons name="key-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>Nenhuma chave cadastrada</Text>
              <Text style={styles.emptySubtitle}>Adicione uma chave PIX para receber seus pagamentos</Text>
              <View style={styles.emptyButton}>
                <Ionicons name="add-circle" size={20} color={colors.primary} />
                <Text style={styles.emptyButtonText}>Adicionar Primeira Chave</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.keysContainer}>
              {pixKeys.map((pixKey) => {
                const isExpanded = expandedKeyId === pixKey.id;
                const isDefault = pixKey.isDefault;

                return (
                  <View 
                    key={pixKey.id} 
                    style={[
                      styles.keyCard,
                      isDefault && styles.keyCardDefault,
                    ]}
                  >
                    <TouchableOpacity 
                      style={styles.keyCardHeader}
                      onPress={() => toggleExpanded(pixKey.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.keyIcon,
                        { backgroundColor: isDefault ? 'rgba(255,255,255,0.2)' : colors.medboxLightGreen }
                      ]}>
                        <Ionicons 
                          name={getPixIcon(pixKey.type)} 
                          size={24} 
                          color={isDefault ? 'white' : colors.primary} 
                        />
                      </View>
                      
                      <View style={styles.keyInfo}>
                        <View style={styles.keyLabelRow}>
                          <Text style={[
                            styles.keyLabel,
                            isDefault && styles.keyLabelDefault
                          ]}>
                            {getPixLabel(pixKey.type)}
                          </Text>
                          {isDefault && (
                            <View style={styles.starBadge}>
                              <Ionicons name="star" size={10} color={colors.warning} />
                              <Text style={styles.starBadgeText}>Padrão</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[
                          styles.keyValue,
                          isDefault && styles.keyValueDefault
                        ]} numberOfLines={1}>
                          {pixKey.key}
                        </Text>
                      </View>

                      <Ionicons 
                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={isDefault ? 'rgba(255,255,255,0.7)' : colors.textSecondary} 
                      />
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.keyActions}>
                        {!isDefault && (
                          <>
                            <TouchableOpacity 
                              style={[styles.keyAction, styles.keyActionPrimary]}
                              onPress={() => handleSetDefault(pixKey.id)}
                            >
                              <Ionicons name="star" size={18} color={colors.warning} />
                              <Text style={[styles.keyActionText, { color: colors.warning }]}>
                                Tornar Padrão
                              </Text>
                            </TouchableOpacity>
                            <View style={styles.keyActionDivider} />
                          </>
                        )}
                        <TouchableOpacity 
                          style={styles.keyAction}
                          onPress={() => navigation.navigate('AddPixKey', { pixKeyId: pixKey.id })}
                        >
                          <Ionicons name="create-outline" size={18} color={colors.primary} />
                          <Text style={styles.keyActionText}>Editar</Text>
                        </TouchableOpacity>
                        <View style={styles.keyActionDivider} />
                        <TouchableOpacity 
                          style={styles.keyAction}
                          onPress={() => handleDeletePixKey(pixKey.id, pixKey.key)}
                        >
                          <Ionicons name="trash-outline" size={18} color={colors.error} />
                          <Text style={[styles.keyActionText, { color: colors.error }]}>
                            Excluir
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Botão Adicionar */}
          {pixKeys.length > 0 && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('AddPixKey', {})}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Adicionar Nova Chave</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Conta Bancária */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta Bancária (Opcional)</Text>
          <Text style={styles.sectionSubtitle}>
            Para saques via TED quando necessário
          </Text>

          {hasBankAccount && bankAccount ? (
            <View style={styles.bankCard}>
              <View style={styles.bankHeader}>
                <View style={styles.bankIconContainer}>
                  <Ionicons name="business" size={24} color={colors.success} />
                </View>
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
                style={styles.bankEditButton}
                onPress={() => navigation.navigate('BankAccount')}
              >
                <Ionicons name="create-outline" size={18} color={colors.primary} />
                <Text style={styles.bankEditText}>Editar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addBankCard}
              onPress={() => navigation.navigate('BankAccount')}
            >
              <Ionicons name="business-outline" size={28} color={colors.textLight} />
              <Text style={styles.addBankTitle}>Adicionar Conta Bancária</Text>
              <Text style={styles.addBankSubtitle}>
                Necessário apenas para saques via TED/DOC
              </Text>
              <View style={styles.addBankButton}>
                <Text style={styles.addBankButtonText}>Cadastrar Conta</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Informações */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="help-circle" size={20} color={colors.info} />
            <Text style={styles.infoTitle}>Por que cadastrar?</Text>
          </View>
          
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.infoText}>Saques via PIX instantâneos e gratuitos</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.infoText}>Chave padrão selecionada automaticamente</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.infoText}>Segurança e privacidade garantidas</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.infoText}>Gerencie múltiplas chaves PIX</Text>
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
    backgroundColor: colors.backgroundLight,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.medboxLightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 16,
  },
  heroStat: {
    alignItems: 'center',
    gap: 4,
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  heroStatLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.divider,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.warning,
  },
  keysContainer: {
    gap: 12,
  },
  keyCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  keyCardDefault: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  keyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  keyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyInfo: {
    flex: 1,
  },
  keyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  keyLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  keyLabelDefault: {
    color: 'rgba(255,255,255,0.9)',
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  starBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.warning,
  },
  keyValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  keyValueDefault: {
    color: 'white',
  },
  keyActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
  },
  keyAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  keyActionPrimary: {
    backgroundColor: colors.warning + '10',
  },
  keyActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  keyActionDivider: {
    width: 1,
    backgroundColor: colors.divider,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  bankCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bankHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  bankIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
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
  bankEditButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.medboxLightGreen,
    gap: 4,
  },
  bankEditText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  addBankCard: {
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: 12,
  },
  addBankTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  addBankSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  addBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  addBankButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    paddingVertical: 40,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.medboxLightGreen,
    borderRadius: 24,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  infoSection: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: colors.backgroundLight,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default BankDataScreen;