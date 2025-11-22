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
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../../contexts/WalletContext';
import { useBank } from '../../contexts/BankContext';
import colors from '../../constants/colors';

type PixKeyType = 'cpf' | 'phone' | 'email' | 'random';

const WithdrawScreen: React.FC = () => {
  const navigation = useNavigation();
  const { balance, withdraw } = useWallet();
  const { defaultPixKey } = useBank();

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
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Converte para número com centavos
    const numberValue = Number(numbers) / 100;
    
    // Formata para moeda brasileira
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

  const pixKeyTypes = [
    { type: 'cpf' as PixKeyType, label: 'CPF', icon: 'person-outline', placeholder: '000.000.000-00' },
    { type: 'phone' as PixKeyType, label: 'Telefone', icon: 'call-outline', placeholder: '(00) 00000-0000' },
    { type: 'email' as PixKeyType, label: 'E-mail', icon: 'mail-outline', placeholder: 'seu@email.com' },
    { type: 'random' as PixKeyType, label: 'Chave Aleatória', icon: 'key-outline', placeholder: 'Chave PIX aleatória' },
  ];

  const handleQuickAmount = (value: number) => {
    setAmount(value.toFixed(2).replace('.', ','));
  };

  const validateForm = (): boolean => {
    const amountValue = getAmountValue();

    if (amountValue <= 0) {
      Alert.alert('Valor inválido', 'Digite um valor para sacar');
      return false;
    }

    if (amountValue < 10) {
      Alert.alert('Valor mínimo', 'O valor mínimo para saque é R$ 10,00');
      return false;
    }

    if (amountValue > balance.available) {
      Alert.alert('Saldo insuficiente', 'Você não tem saldo disponível para este saque');
      return false;
    }

    if (!pixKey.trim()) {
      Alert.alert('Chave PIX obrigatória', 'Digite sua chave PIX');
      return false;
    }

    return true;
  };

  const handleWithdraw = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const amountValue = getAmountValue();
      const success = await withdraw(amountValue, pixKey);

      if (success) {
        Alert.alert(
          'Saque Solicitado!',
          `Seu saque de R$ ${amount} foi solicitado e será processado em até 1 dia útil.`,
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sacar</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Saldo Disponível */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo disponível para saque</Text>
            <Text style={styles.balanceAmount}>
              R$ {balance.available.toFixed(2).replace('.', ',')}
            </Text>
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

            {/* Valores Rápidos */}
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

          {/* Tipo de Chave PIX */}
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
                    size={20}
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

          {/* Chave PIX */}
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

          {/* Informações */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>
                • Valor mínimo para saque: R$ 10,00
              </Text>
              <Text style={styles.infoText}>
                • O saque será processado em até 1 dia útil
              </Text>
              <Text style={styles.infoText}>
                • Sem taxas para saques via PIX
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Botão de Confirmar */}
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
  pixTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pixTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pixTypeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.medboxLightGreen,
  },
  pixTypeText: {
    fontSize: 14,
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