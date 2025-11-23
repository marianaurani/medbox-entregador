// src/screens/wallet/WithdrawScreen.tsx (VERSÃO FINAL CORRIGIDA)
import React, { useState } from 'react';
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
import { useWallet } from '../../contexts/WalletContext';
import { useBank, PixKeyType } from '../../contexts/BankContext';
import colors from '../../constants/colors';

type WithdrawMethod = 'pix' | 'bank' | 'ted';

const WithdrawScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { balance, withdraw } = useWallet();
  const { defaultPixKey, bankAccount } = useBank();

  const [amount, setAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<WithdrawMethod>('pix');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Formata moeda para exibição (sem Math.abs - valores já são positivos aqui)
  const formatCurrency = (value: string | number) => {
    if (typeof value === 'number') {
      return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    
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

  const getPixIcon = (type: PixKeyType): any => {
    const icons: { [key in PixKeyType]: string } = {
      cpf: 'person',
      telefone: 'call',
      email: 'mail',
      aleatoria: 'key',
    };
    return icons[type];
  };

  const getPixLabel = (type: PixKeyType) => {
    const labels: { [key in PixKeyType]: string } = {
      cpf: 'CPF',
      telefone: 'Telefone',
      email: 'E-mail',
      aleatoria: 'Chave Aleatória',
    };
    return labels[type];
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toFixed(2).replace('.', ','));
  };

  const getMinimumAmount = (): number => {
    return withdrawMethod === 'pix' ? 10 : 20;
  };

  const getFee = (): number => {
    return withdrawMethod === 'ted' ? 5 : 0;
  };

  const canProceed = (): boolean => {
    const amountValue = getAmountValue();
    if (amountValue <= 0) return false;
    if (withdrawMethod === 'pix' && !defaultPixKey) return false;
    if ((withdrawMethod === 'bank' || withdrawMethod === 'ted') && !bankAccount) return false;
    return true;
  };

  const handleNavigateToBankData = () => {
    navigation.navigate('Menu', {
      screen: 'BankData'
    });
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

    if (withdrawMethod === 'pix' && !defaultPixKey) {
      Alert.alert(
        'Chave PIX necessária', 
        'Configure uma chave PIX antes de continuar.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Configurar', onPress: handleNavigateToBankData }
        ]
      );
      return false;
    }

    if ((withdrawMethod === 'bank' || withdrawMethod === 'ted') && !bankAccount) {
      Alert.alert(
        'Conta bancária necessária', 
        'Configure uma conta bancária antes de continuar.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Configurar', onPress: handleNavigateToBankData }
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
        ? defaultPixKey?.key || ''
        : `${bankAccount?.bank} - ${bankAccount?.account}-${bankAccount?.digit}`;
      
      const success = await withdraw(totalAmount, destination);

      if (success) {
        const methodName = withdrawMethod === 'pix' ? 'PIX' : withdrawMethod === 'bank' ? 'Transferência bancária' : 'TED';
        const timeText = withdrawMethods.find(m => m.method === withdrawMethod)?.time;
        
        Alert.alert(
          'Saque Solicitado!',
          `Seu saque de R$ ${amount} via ${methodName} foi solicitado.\n\nTempo de processamento: ${timeText}${fee > 0 ? `\nTaxa: R$ ${fee.toFixed(2).replace('.', ',')}` : ''}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sacar</Text>
          <TouchableOpacity onPress={handleNavigateToBankData}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Saldo Disponível */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>
            <Text style={styles.balanceAmount}>
              R$ {formatCurrency(balance.available)}
            </Text>
          </View>

          {/* Quanto deseja sacar */}
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
          </View>

          {/* Método de Saque */}
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

          {/* Destino do Saque */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {withdrawMethod === 'pix' ? 'Chave PIX' : 'Conta Bancária'}
              </Text>
              <TouchableOpacity onPress={handleNavigateToBankData}>
                <Text style={styles.changeLink}>Gerenciar</Text>
              </TouchableOpacity>
            </View>

            {withdrawMethod === 'pix' ? (
              defaultPixKey ? (
                <View style={styles.destinationCard}>
                  <View style={[styles.destinationIcon, { backgroundColor: colors.medboxLightGreen }]}>
                    <Ionicons name={getPixIcon(defaultPixKey.type)} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.destinationInfo}>
                    <Text style={styles.destinationType}>{getPixLabel(defaultPixKey.type)}</Text>
                    <Text style={styles.destinationValue} numberOfLines={1}>{defaultPixKey.key}</Text>
                  </View>
                  <View style={styles.defaultBadge}>
                    <Ionicons name="star" size={12} color={colors.warning} />
                    <Text style={styles.defaultBadgeText}>Padrão</Text>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.addDestinationButton}
                  onPress={handleNavigateToBankData}
                >
                  <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                  <Text style={styles.addDestinationText}>Adicionar Chave PIX</Text>
                </TouchableOpacity>
              )
            ) : (
              bankAccount ? (
                <View style={styles.destinationCard}>
                  <View style={[styles.destinationIcon, { backgroundColor: colors.success + '20' }]}>
                    <Ionicons name="business" size={24} color={colors.success} />
                  </View>
                  <View style={styles.destinationInfo}>
                    <Text style={styles.destinationType}>{bankAccount.bank}</Text>
                    <Text style={styles.destinationValue}>
                      Ag: {bankAccount.agency} • Conta: {bankAccount.account}-{bankAccount.digit}
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.addDestinationButton}
                  onPress={handleNavigateToBankData}
                >
                  <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                  <Text style={styles.addDestinationText}>Adicionar Conta Bancária</Text>
                </TouchableOpacity>
              )
            )}
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
                <Text style={styles.feeValue}>R$ {formatCurrency(getFee())}</Text>
              </View>
              <View style={styles.feeDivider} />
              <View style={styles.feeRow}>
                <Text style={styles.feeTotalLabel}>Total a ser debitado</Text>
                <Text style={styles.feeTotalValue}>
                  R$ {formatCurrency(getAmountValue() + getFee())}
                </Text>
              </View>
            </View>
          )}

          {/* Informações */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>
                • Valor mínimo: R$ {formatCurrency(getMinimumAmount())}
              </Text>
              <Text style={styles.infoText}>
                • Tempo: {withdrawMethods.find(m => m.method === withdrawMethod)?.time}
              </Text>
              {withdrawMethod === 'pix' && (
                <Text style={styles.infoText}>
                  • Saques via PIX são gratuitos e instantâneos
                </Text>
              )}
            </View>
          </View>

          {/* Botão de Confirmar */}
          <TouchableOpacity
            style={[styles.confirmButton, (!canProceed() || isSubmitting) && styles.confirmButtonDisabled]}
            onPress={handleWithdraw}
            disabled={!canProceed() || isSubmitting}
          >
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text style={styles.confirmButtonText}>
              {isSubmitting ? 'Processando...' : 'Confirmar Saque'}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  changeLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
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
  methodsContainer: {
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 16,
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
    marginBottom: 4,
  },
  methodLabelActive: {
    color: colors.primary,
  },
  methodTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  methodFee: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  destinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  destinationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationInfo: {
    flex: 1,
  },
  destinationType: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  destinationValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
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
  addDestinationButton: {
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
  },
  addDestinationText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  feeCard: {
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.medboxLightGreen,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
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
    opacity: 0.5,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WithdrawScreen;