// src/screens/profile/BankAccountScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useBank, AccountType } from '../../contexts/BankContext';
import colors from '../../constants/colors';

// Lista de bancos brasileiros
const BANKS = [
  { code: '001', name: 'Banco do Brasil' },
  { code: '033', name: 'Santander' },
  { code: '104', name: 'Caixa Econômica Federal' },
  { code: '237', name: 'Bradesco' },
  { code: '341', name: 'Itaú' },
  { code: '260', name: 'Nubank' },
  { code: '077', name: 'Inter' },
  { code: '212', name: 'Banco Original' },
  { code: '336', name: 'C6 Bank' },
  { code: '290', name: 'PagSeguro' },
];

const BankAccountScreen: React.FC = () => {
  const navigation = useNavigation();
  const { bankAccount, updateBankAccount } = useBank();

  const [selectedBank, setSelectedBank] = useState('');
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('corrente');
  const [agency, setAgency] = useState('');
  const [account, setAccount] = useState('');
  const [digit, setDigit] = useState('');
  const [showBankList, setShowBankList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bankAccount) {
      setSelectedBank(bankAccount.bank);
      setSelectedBankCode(bankAccount.bankCode);
      setAccountType(bankAccount.accountType);
      setAgency(bankAccount.agency);
      setAccount(bankAccount.account);
      setDigit(bankAccount.digit);
    }
  }, [bankAccount]);

  const handleSelectBank = (bankName: string, bankCode: string) => {
    setSelectedBank(bankName);
    setSelectedBankCode(bankCode);
    setShowBankList(false);
  };

  const validateForm = (): boolean => {
    if (!selectedBank) {
      Alert.alert('Banco Obrigatório', 'Selecione um banco');
      return false;
    }

    if (!agency.trim()) {
      Alert.alert('Agência Obrigatória', 'Digite o número da agência');
      return false;
    }

    if (!account.trim()) {
      Alert.alert('Conta Obrigatória', 'Digite o número da conta');
      return false;
    }

    if (!digit.trim()) {
      Alert.alert('Dígito Obrigatório', 'Digite o dígito da conta');
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      updateBankAccount({
        bank: selectedBank,
        bankCode: selectedBankCode,
        accountType,
        agency,
        account,
        digit,
      });

      Alert.alert('Sucesso!', 'Dados bancários salvos com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar os dados. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Conta Bancária</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          {/* Banco */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Banco</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setShowBankList(!showBankList)}
            >
              <Ionicons name="business-outline" size={20} color={colors.textSecondary} />
              <Text style={[
                styles.selectButtonText,
                !selectedBank && styles.selectButtonPlaceholder
              ]}>
                {selectedBank || 'Selecione o banco'}
              </Text>
              <Ionicons 
                name={showBankList ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>

            {showBankList && (
              <View style={styles.bankList}>
                <ScrollView style={styles.bankListScroll} nestedScrollEnabled>
                  {BANKS.map((bank) => (
                    <TouchableOpacity
                      key={bank.code}
                      style={styles.bankItem}
                      onPress={() => handleSelectBank(bank.name, bank.code)}
                    >
                      <Text style={styles.bankName}>{bank.name}</Text>
                      <Text style={styles.bankCode}>{bank.code}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Tipo de Conta */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipo de Conta</Text>
            <View style={styles.accountTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.accountTypeButton,
                  accountType === 'corrente' && styles.accountTypeButtonActive,
                ]}
                onPress={() => setAccountType('corrente')}
              >
                <Ionicons
                  name="card-outline"
                  size={20}
                  color={accountType === 'corrente' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.accountTypeText,
                    accountType === 'corrente' && styles.accountTypeTextActive,
                  ]}
                >
                  Conta Corrente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.accountTypeButton,
                  accountType === 'poupanca' && styles.accountTypeButtonActive,
                ]}
                onPress={() => setAccountType('poupanca')}
              >
                <Ionicons
                  name="wallet-outline"
                  size={20}
                  color={accountType === 'poupanca' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.accountTypeText,
                    accountType === 'poupanca' && styles.accountTypeTextActive,
                  ]}
                >
                  Conta Poupança
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Agência */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agência</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="business-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={agency}
                onChangeText={setAgency}
                placeholder="0000"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          </View>

          {/* Conta e Dígito */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conta</Text>
            <View style={styles.accountRow}>
              <View style={[styles.inputContainer, { flex: 3 }]}>
                <Ionicons name="card-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={account}
                  onChangeText={setAccount}
                  placeholder="00000000"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <TextInput
                  style={[styles.input, { textAlign: 'center' }]}
                  value={digit}
                  onChangeText={setDigit}
                  placeholder="0"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>
            <Text style={styles.helperText}>
              Digite o número da conta sem o dígito, depois digite o dígito separadamente
            </Text>
          </View>

          {/* Info */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                Esses dados serão usados para transferências bancárias (TED/DOC) quando necessário.
              </Text>
            </View>
          </View>

          {/* Botão Salvar (agora dentro do ScrollView) */}
          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Salvando...' : 'Salvar Dados'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
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
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  selectButtonText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  selectButtonPlaceholder: {
    color: colors.textLight,
  },
  bankList: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    overflow: 'hidden',
  },
  bankListScroll: {
    maxHeight: 200,
  },
  bankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  bankCode: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  accountTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  accountTypeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.medboxLightGreen,
  },
  accountTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  accountTypeTextActive: {
    color: colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  accountRow: {
    flexDirection: 'row',
    gap: 12,
  },
  helperText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8,
    lineHeight: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.medboxLightGreen,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BankAccountScreen;