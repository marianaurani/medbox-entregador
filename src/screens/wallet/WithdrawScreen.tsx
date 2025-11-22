// src/screens/wallet/WithdrawScreen.tsx
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
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useWallet } from '../../contexts/WalletContext';
import { useBank, PixKeyType } from '../../contexts/BankContext';
import colors from '../../constants/colors';

type WithdrawMethod = 'pix' | 'bank' | 'ted';

const WithdrawScreen: React.FC = () => {
  const navigation = useNavigation();
  const { balance, withdraw } = useWallet();
  const { defaultPixKey, bankAccount } = useBank();

  const [withdrawMethod, setWithdrawMethod] = useState<WithdrawMethod>('pix');
  const [amount, setAmount] = useState('');
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('cpf');
  const [pixKey, setPixKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pré-preenche com a chave padrão se existir
  useEffect(() => {
    if (defaultPixKey) {
      setPixKeyType(defaultPixKey.type);
      setPixKey(defaultPixKey.key);
    }
  }, [defaultPixKey]);

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const numberValue = Number(numbers) / 100;
    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatCurrency(text);
    setAmount(formatted);
  };

  const getAmountValue = (): number => {
    const numbers = amount.replace(/\D/g, '');
    return Number(numbers) / 100;
  };

  const withdrawMethods = [
    { 
      method: 'pix' as WithdrawMethod, 
      label: 'PIX', 
      icon: 'flash', 
      time: 'Imediato',
      fee: 'Grátis',
      color: colors.primary 
    },
    { 
      method: 'bank' as WithdrawMethod, 
      label: 'Transferência', 
      icon: 'business', 
      time: '1 dia útil',
      fee: 'Grátis',
      color: colors.info 
    },
    { 
      method: 'ted' as WithdrawMethod, 
      label: 'TED', 
      icon: 'swap-horizontal', 
      time: 'Até 2h',
      fee: 'R$ 5,00',
      color: colors.warning 
    },
  ];

  const pixKeyTypes = [
    { type: 'cpf' as PixKeyType, label: 'CPF', icon: 'person-outline', placeholder: '000.000.000-00' },
    { type: 'phone' as PixKeyType, label: 'Telefone', icon: 'call-outline', placeholder: '(00) 00000-0000' },
    { type: 'email' as PixKeyType, label: 'E-mail', icon: 'mail-outline', placeholder: 'seu@email.com' },
    { type: 'random' as PixKeyType, label: 'Aleatória', icon: 'key-outline', placeholder: 'Chave aleatória' },
  ];

  const handleQuickAmount = (value: number) => {
    setAmount(value.toFixed(2).replace('.', ','));
  };

  const getMinimumAmount = (): number => {
    return withdrawMethod === 'pix' ? 10 : 20;
  };

  const getFee = (): number => {
    return withdrawMethod === 'ted' ? 5 : 0;
  };

  const validateForm = (): boolean => {
    const amountValue = getAmountValue();
    const minAmount = getMinimumAmount();
    const fee = getFee();
    const totalAmount = amountValue + fee;

    if (amountValue <= 0) {
      Alert.alert('Valor inválido', 'Digite um valor para sacar');
      return false;
    }

    if (amountValue < minAmount) {
      Alert.alert(
        'Valor mínimo', 
        `O valor mínimo para ${withdrawMethod === 'pix' ? 'PIX' : withdrawMethod === 'bank' ? 'Transferência' : 'TED'} é R$ ${minAmount.toFixed(2).replace('.', ',')}`
      );
      return false;
    }

    if (totalAmount > balance.available) {
      Alert.alert(
        'Saldo insuficiente', 
        `Você não tem saldo disponível para este saque.${fee > 0 ? ` (Inclui taxa de R$ ${fee.toFixed(2).replace('.', ',')})` : ''}`
      );
      return false;
    }

    if (withdrawMethod === 'pix' && !pixKey.trim()) {
      Alert.alert('Chave PIX obrigatória', 'Digite sua chave PIX');
      return false;
    }

    if ((withdrawMethod === 'bank' || withdrawMethod === 'ted') && !bankAccount) {
      Alert.alert(
        'Conta bancária necessária', 
        'Você precisa cadastrar uma conta bancária primeiro.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Cadastrar Agora', 
            onPress: () => {
              navigation.dispatch(
                CommonActions.navigate({
                  name: 'Menu',
                  params: {
                    screen: 'Profile',
                    params: {
                      screen: 'BankAccount',
                    },
                  },
                })
              );
            }
          }
        ]
      );
      return false;
    }

    return true;
  };

  const handleWithdraw = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const amountValue = getAmountValue();
      const fee = getFee();
      const totalAmount = amountValue + fee;
      
      const destination = withdrawMethod === 'pix' 
        ? pixKey 
        : `${bankAccount?.bank} - ${bankAccount?.account}-${bankAccount?.digit}`;
      
      const success = await withdraw(totalAmount, destination);

      if (success) {
        const methodName = withdrawMethod === 'pix' ? 'PIX' : withdrawMethod === 'bank' ? 'Transferência bancária' : 'TED';
        const timeText = withdrawMethods.find(m => m.method === withdrawMethod)?.time;
        
        Alert.alert(
          'Saque Solicitado!',
          `Seu saque de R$ ${amount} via ${methodName} foi solicitado.\n\nTempo de processamento: ${timeText}${fee > 0 ? `\nTaxa: R$ ${fee.toFixed(2).replace('.', ',')}` : ''}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível realizar o saque. Verifique os dados e tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao processar o saque. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = [50, 100, 200, balance.available];

  const renderPixForm = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipo de Chave PIX</Text>
        <View style={styles.pixTypesContainer}>
          {pixKeyTypes.map((type) => (
            <TouchableOpacity
              key={type.type}
              style={[
                styles.pixTypeButton,
                pixKeyType === type.type && styles.pixTypeButtonActive,
              ]}
              onPress={() => setPixKeyType(type.type)}
            >
              <Ionicons
                name={type.icon as any}
                size={18}
                color={pixKeyType === type.type ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.pixTypeText,
                  pixKeyType === type.type && styles.pixTypeTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chave PIX</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name={pixKeyTypes.find((t) => t.type === pixKeyType)?.icon as any}
            size={20}
            color={colors.textSecondary}
          />
          <TextInput
            style={styles.input}
            value={pixKey}
            onChangeText={setPixKey}
            placeholder={pixKeyTypes.find((t) => t.type === pixKeyType)?.placeholder}
            placeholderTextColor={colors.textLight}
            keyboardType={
              pixKeyType === 'phone' ? 'phone-pad' : pixKeyType === 'email' ? 'email-address' : 'default'
            }
          />
        </View>
      </View>
    </>
  );

  const renderBankForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Conta Bancária</Text>
      {bankAccount ? (
        <View style={styles.bankAccountCard}>
          <View style={styles.bankAccountHeader}>
            <Ionicons name="business" size={24} color={colors.primary} />
            <View style={styles.bankAccountInfo}>
              <Text style={styles.bankAccountName}>{bankAccount.bank}</Text>
              <Text style={styles.bankAccountDetails}>
                Ag: {bankAccount.agency} • Conta: {bankAccount.account}-{bankAccount.digit}
              </Text>
              <Text style={styles.bankAccountType}>
                {bankAccount.accountType === 'corrente' ? 'Conta Corrente' : 'Conta Poupança'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.changeBankButton}
            onPress={() => {
              navigation.dispatch(
                CommonActions.navigate({
                  name: 'Menu',
                  params: {
                    screen: 'Profile',
                    params: {
                      screen: 'BankAccount',
                    },
                  },
                })
              );
            }}
          >
            <Text style={styles.changeBankText}>Alterar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.addBankButton}
          onPress={() => {
            navigation.dispatch(
              CommonActions.navigate({
                name: 'Menu',
                params: {
                  screen: 'Profile',
                  params: {
                    screen: 'BankAccount',
                  },
                },
              })
            );
          }}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.addBankText}>Adicionar Conta Bancária</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sacar</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo disponível para saque</Text>
            <Text style={styles.balanceAmount}>
              R$ {balance.available.toFixed(2).replace('.', ',')}
            </Text>
          </View>

          {/* Métodos de Saque */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Método de Saque</Text>
            <View style={styles.methodsContainer}>
              {withdrawMethods.map((method) => (
                <TouchableOpacity
                  key={method.method}
                  style={[
                    styles.methodCard,
                    withdrawMethod === method.method && styles.methodCardActive,
                  ]}
                  onPress={() => setWithdrawMethod(method.method)}
                >
                  <View style={[styles.methodIcon, { backgroundColor: `${method.color}15` }]}>
                    <Ionicons name={method.icon as any} size={24} color={method.color} />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={[
                      styles.methodLabel,
                      withdrawMethod === method.method && styles.methodLabelActive
                    ]}>
                      {method.label}
                    </Text>
                    <Text style={styles.methodTime}>{method.time}</Text>
                    <Text style={[
                      styles.methodFee,
                      method.fee === 'Grátis' && { color: colors.success }
                    ]}>
                      {method.fee}
                    </Text>
                  </View>
                  {withdrawMethod === method.method && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Valor do Saque */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quanto deseja sacar?</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>R$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                placeholder="0,00"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.quickAmountsContainer}>
              {quickAmounts.map((value, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickAmountButton}
                  onPress={() => handleQuickAmount(value)}
                >
                  <Text style={styles.quickAmountText}>
                    {index === 3 ? 'Tudo' : `R$ ${value}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Resumo de Taxa */}
            {getFee() > 0 && getAmountValue() > 0 && (
              <View style={styles.feeCard}>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Valor do saque</Text>
                  <Text style={styles.feeValue}>R$ {amount}</Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Taxa</Text>
                  <Text style={styles.feeValue}>R$ {getFee().toFixed(2).replace('.', ',')}</Text>
                </View>
                <View style={styles.feeDivider} />
                <View style={styles.feeRow}>
                  <Text style={styles.feeTotalLabel}>Total a ser debitado</Text>
                  <Text style={styles.feeTotalValue}>
                    R$ {(getAmountValue() + getFee()).toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Formulário específico do método */}
          {withdrawMethod === 'pix' && renderPixForm()}
          {(withdrawMethod === 'bank' || withdrawMethod === 'ted') && renderBankForm()}

          {/* Informações */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>
                • Valor mínimo: R$ {getMinimumAmount().toFixed(2).replace('.', ',')}
              </Text>
              <Text style={styles.infoText}>
                • Tempo: {withdrawMethods.find(m => m.method === withdrawMethod)?.time}
              </Text>
              {withdrawMethod === 'pix' && (
                <Text style={styles.infoText}>
                  • Saques via PIX são gratuitos e instantâneos
                </Text>
              )}
              {withdrawMethod === 'ted' && (
                <Text style={styles.infoText}>
                  • TED tem taxa de R$ 5,00 mas é processado em até 2 horas
                </Text>
              )}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
            onPress={handleWithdraw}
            disabled={isSubmitting}
          >
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text style={styles.confirmButtonText}>
              {isSubmitting ? 'Processando...' : 'Confirmar Saque'}
            </Text>
          </TouchableOpacity>
        </View>
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
  balanceCard: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
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
  methodsContainer: {
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 12,
  },
  methodCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.medboxLightGreen,
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  methodLabelActive: {
    color: colors.primary,
  },
  methodTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  methodFee: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAmountText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  feeCard: {
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  feeDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 4,
  },
  feeTotalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  feeTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  pixTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pixTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pixTypeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.medboxLightGreen,
  },
  pixTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pixTypeTextActive: {
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
  bankAccountCard: {
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bankAccountHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  bankAccountInfo: {
    flex: 1,
  },
  bankAccountName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  bankAccountDetails: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  bankAccountType: {
    fontSize: 12,
    color: colors.textLight,
  },
  changeBankButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.medboxLightGreen,
  },
  changeBankText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  addBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    gap: 10,
  },
  addBankText: {
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
  },
  infoTextContainer: {
    flex: 1,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  bottomContainer: {
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
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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

export default WithdrawScreen;