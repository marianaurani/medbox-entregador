// src/navigation/WalletNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WalletScreen from '../screens/wallet/WalletScreen';
import TransactionsScreen from '../screens/wallet/TransactionsScreen';
import WithdrawScreen from '../screens/wallet/WithdrawScreen';
import WalletSettingsScreen from '../screens/wallet/WalletSettingsScreen';
import TransactionDetailsScreen from '../screens/wallet/TransactionDetailsScreen';
// ✅ NOVOS IMPORTS - Telas de Dados Bancários
import BankDataScreen from '../screens/profile/BankDataScreen';
import BankAccountScreen from '../screens/profile/BankAccountScreen';
import AddPixKeyScreen from '../screens/profile/AddPixKeyScreen';

export type WalletStackParamList = {
  WalletHome: undefined;
  Transactions: undefined;
  Withdraw: undefined;
  WalletSettings: undefined;
  TransactionDetails: { transactionId: string };
  // ✅ NOVAS ROTAS - Dados Bancários acessíveis da Carteira
  BankData: undefined;
  BankAccount: undefined;
  AddPixKey: { pixKeyId?: string } | undefined;
};

const Stack = createNativeStackNavigator<WalletStackParamList>();

export const WalletNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="WalletHome" 
        component={WalletScreen}
      />
      <Stack.Screen 
        name="Transactions" 
        component={TransactionsScreen}
      />
      <Stack.Screen 
        name="Withdraw" 
        component={WithdrawScreen}
      />
      <Stack.Screen 
        name="WalletSettings" 
        component={WalletSettingsScreen}
      />
      <Stack.Screen 
        name="TransactionDetails" 
        component={TransactionDetailsScreen}
      />
      {/* ✅ NOVAS ROTAS - Dados Bancários */}
      <Stack.Screen 
        name="BankData" 
        component={BankDataScreen}
      />
      <Stack.Screen 
        name="BankAccount" 
        component={BankAccountScreen}
      />
      <Stack.Screen 
        name="AddPixKey" 
        component={AddPixKeyScreen}
      />
    </Stack.Navigator>
  );
};

export default WalletNavigator;