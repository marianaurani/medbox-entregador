// src/navigation/WalletNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WalletScreen from '../screens/wallet/WalletScreen';
import TransactionsScreen from '../screens/wallet/TransactionsScreen';
import WithdrawScreen from '../screens/wallet/WithdrawScreen';
import WalletSettingsScreen from '../screens/wallet/WalletSettingsScreen';
import TransactionDetailsScreen from '../screens/wallet/TransactionDetailsScreen';

export type WalletStackParamList = {
  WalletHome: undefined;
  Transactions: undefined;
  Withdraw: undefined;
  WalletSettings: undefined;
  TransactionDetails: { transactionId: string }; // ✅ NOVO
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
      {/* ✅ NOVA ROTA */}
      <Stack.Screen 
        name="TransactionDetails" 
        component={TransactionDetailsScreen}
      />
    </Stack.Navigator>
  );
};