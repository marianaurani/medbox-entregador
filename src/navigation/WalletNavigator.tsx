// src/navigation/WalletNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WalletScreen from '../screens/wallet/WalletScreen';
import TransactionsScreen from '../screens/wallet/TransactionsScreen';
import WithdrawScreen from '../screens/wallet/WithdrawScreen';

export type WalletStackParamList = {
  WalletHome: undefined;
  Transactions: undefined;
  Withdraw: undefined;
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
    </Stack.Navigator>
  );
};