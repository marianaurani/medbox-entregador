// src/navigation/ProfileNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BankDataScreen from '../screens/profile/BankDataScreen';
import BankAccountScreen from '../screens/profile/BankAccountScreen';
import AddPixKeyScreen from '../screens/profile/AddPixKeyScreen';

export type ProfileStackParamList = {
  ProfileHome: undefined;
  BankData: undefined;
  BankAccount: undefined;
  AddPixKey: { pixKeyId?: string };   // ✅ Removido "| undefined"
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="ProfileHome" 
        component={ProfileScreen}
      />
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
